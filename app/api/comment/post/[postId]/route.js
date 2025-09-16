import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import mongoose from "mongoose";

// create a comment
// POST /api/comment/post/[postId]
export async function POST(req, { params }) {
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

        const { postId } = params;
        if (!isValidObjectId(postId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        const { text } = (await req.json()) || {};
        if (!text) {
            return NextResponse.json({ success: false, message: "Text is required" }, { status: 400 });
        }

        // Create new comment
        const comment = await Comment.create({
            text: text.trim(),
            author: user._id,
            post: post._id,
        });

        // Push comment id to post's comments array
        post.comments.push(comment._id);
        await post.save();

        return NextResponse.json({ success: true, message: "Comment created successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// get post comments
// GET /api/comment/post/[postId]
export async function GET(req, { params }) {
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

        const { postId } = params;
        if (!isValidObjectId(postId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }
        const post = await Post.findById(postId).populate("author");
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        const comments = await Comment.aggregate([
            {
                $match: {
                    post: new mongoose.Types.ObjectId(post._id),
                },
            },
            {
                $addFields: {
                    sortWeight: {
                        $cond: [
                            { $eq: ["$author", user._id] },
                            3,
                            {
                                $cond: [{ $eq: ["$author", post.author] }, 2, 1],
                            },
                        ],
                    },
                    isAuthor: { $eq: ["$author", user._id] },
                },
            },
            { $sort: { sortWeight: -1, createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                profileImage: 1,
                                gender: 1,
                            },
                        },
                    ],
                },
            },
            { $set: { author: { $first: "$author" } } },
            {
                $project: {
                    _id: 1,
                    text: 1,
                    createdAt: 1,
                    isAuthor: 1,
                    author: 1,
                },
            },
        ]);

        return NextResponse.json({ success: true, comments }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
