import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Post from "@/models/Post";

// get User Posts
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ clerkId: userId });
        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
        }
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const posts = await Post.aggregate([
            {
                $match: { author: new mongoose.Types.ObjectId(user._id) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            { $unwind: "$author" },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    isLiked: { $in: [loggedInUser._id, "$likes"] },
                    isBookmarked: { $in: ["$_id", loggedInUser.bookmarks] },
                    isAuthor: { $eq: ["$author._id", loggedInUser._id] }, // ✅ Add this
                },
            },
            {
                $project: {
                    _id: 1,
                    caption: 1,
                    image: 1,
                    createdAt: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    isBookmarked: 1,
                    isAuthor: 1,
                    isLiked: 1,
                    author: {
                        _id: "$author._id",
                        username: "$author.username",
                        profileImage: "$author.profileImage",
                        gender: "$author.gender",
                    },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);

        return NextResponse.json({ success: true, posts }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
