import User from "@/models/User";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import Post from "@/models/Post";
import mongoose from "mongoose";

// get post by id
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Fetch user with bookmarks
        const user = await User.findOne({ clerkId: userId }).select("_id bookmarks").lean();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const userBookmarks = Array.isArray(user.bookmarks) ? user.bookmarks : [];

        const posts = await Post.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },

            // Lookup author
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

            // Compute post-related fields
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    isLiked: { $in: [user._id, { $ifNull: ["$likes", []] }] },
                    isBookmarked: { $in: ["$_id", userBookmarks] },
                    isAuthor: { $eq: ["$author._id", user._id] },
                },
            },

            // Final projection without comments
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    caption: 1,
                    image: 1,
                    likesCount: 1,
                    isLiked: 1,
                    isBookmarked: 1,
                    isAuthor: 1,
                    author: {
                        _id: "$author._id",
                        username: "$author.username",
                        profileImage: "$author.profileImage",
                        gender: "$author.gender",
                    },
                },
            },
        ]);

        if (!posts.length) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, post: posts[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// update post by id
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        // Check if the logged-in user is the author of the post
        if (post.author.toString() !== user._id.toString()) {
            return NextResponse.json({ success: false, message: "You are not the author of this post" }, { status: 403 });
        }

        const formData = await req.formData();
        const caption = formData.get("caption");
        const image = formData.get("image");

        // ✅ Only update caption if provided (even empty string allowed)
        if (caption !== null) {
            post.caption = caption.trim();
        }

        // ✅ Only update image if provided
        if (image && image.size > 0) {
            const imageCloudinary = await uploadOnCloudinary(image);
            if (!imageCloudinary) {
                return NextResponse.json({ success: false, message: "Image upload failed" }, { status: 500 });
            }

            // Delete old image
            if (post.image?.public_id) {
                await deleteFromCloudinary(post.image.public_id);
            }

            post.image = {
                url: imageCloudinary.secure_url,
                public_id: imageCloudinary.public_id,
            };
        }

        await post.save();

        return NextResponse.json({ success: true, post, message: "Post updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// delete post by id
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        if (post.author.toString() !== user._id.toString()) {
            throw new ApiError(403, "Unauthorized");
        }

        // ✅ Trigger middleware
        await post.deleteOne(); // This runs pre("remove") hook
        // which will delete all the post Images from cloudinary and comments from DB

        // Clean up reference in user
        await User.findByIdAndUpdate(user._id, { $pull: { posts: id } }, { new: true });

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
