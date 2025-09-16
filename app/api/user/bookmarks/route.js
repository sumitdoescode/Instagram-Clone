import User from "@/models/User";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// get user's own bookmarks,
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

        const bookmarks = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(user._id),
                },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "bookmarks",
                    foreignField: "_id",
                    as: "bookmarks",
                },
            },
            { $unwind: "$bookmarks" },
            {
                $lookup: {
                    from: "users",
                    localField: "bookmarks.author",
                    foreignField: "_id",
                    as: "bookmarks.author",
                },
            },
            { $unwind: "$bookmarks.author" }, // ✅ fix here
            {
                $addFields: {
                    likesCount: { $size: "$bookmarks.likes" },
                    commentsCount: { $size: "$bookmarks.comments" },
                    isLiked: { $in: [user._id, "$bookmarks.likes"] },
                    isAuthor: { $eq: ["$bookmarks.author._id", user._id] },
                    isBookmarked: true, // hardcoded true because it's coming from bookmarks
                },
            },
            {
                $sort: { "bookmarks.createdAt": -1 }, // ✅ sort bookmarks, not root doc
            },
            {
                $project: {
                    _id: "$bookmarks._id",
                    caption: "$bookmarks.caption",
                    image: "$bookmarks.image",
                    createdAt: "$bookmarks.createdAt",
                    likesCount: 1,
                    commentsCount: 1,
                    isLiked: 1,
                    isAuthor: 1,
                    isBookmarked: 1,
                    author: {
                        _id: "$bookmarks.author._id",
                        username: "$bookmarks.author.username",
                        profileImage: "$bookmarks.author.profileImage",
                        gender: "$bookmarks.author.gender",
                    },
                },
            },
        ]);

        return NextResponse.json({ success: true, bookmarks }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
