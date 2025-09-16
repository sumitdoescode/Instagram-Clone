import User from "@/models/User";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import Post from "@/models/Post";

// get all posts / feed posts
export async function GET(req) {
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

        const posts = await Post.aggregate([
            // Join with the User collection to get author data
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            // Flatten the author array to an object
            {
                $unwind: "$author",
            },
            // Add a computed field to check if loggedInUser has liked the post
            {
                $addFields: {
                    isLiked: {
                        $in: [user._id, "$likes"],
                    },
                    isBookmarked: {
                        $in: ["$_id", user.bookmarks],
                    },
                    isAuthor: {
                        $eq: ["$author._id", user._id], // ✅ Add this
                    },
                },
            },
            // Project fields + computed likeCount and commentCount
            {
                $project: {
                    caption: 1,
                    image: 1,
                    createdAt: 1,
                    likesCount: { $size: "$likes" },
                    commentCount: { $size: "$comments" },
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
            // Sort newest first
            {
                $sort: { createdAt: -1 },
            },
        ]);
        return NextResponse.json({ success: true, posts }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// create post
export async function POST(req) {
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

        const formData = await req.formData();
        const caption = formData.get("caption");
        const image = formData.get("image");

        if (!caption || !image) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Upload image to Cloudinary
        const imageCloudinary = await uploadOnCloudinary(image);

        const post = await Post.create({
            caption: caption.trim(),
            image: {
                url: imageCloudinary.secure_url,
                public_id: imageCloudinary.public_id,
            },
            author: user._id,
        });

        // Push post to user's posts array
        await User.findByIdAndUpdate(user._id, { $push: { posts: post._id } }, { new: true });

        return NextResponse.json({ success: true, message: "Post created successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
