import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Post from "@/models/Post";

// toggle like on post
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

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
        }

        // Check if the post is already liked by the user
        if (post.likes.includes(user._id)) {
            // If already like, unlike the post
            await post.updateOne({ $pull: { likes: user._id } });
            await post.save();
            return NextResponse.json({ success: true, message: "Post unliked", isLiked: false });
        } else {
            // If not liked, like the post
            await post.updateOne({ $addToSet: { likes: user._id } });
            await post.save();
            return NextResponse.json({ success: true, message: "Post liked", isLiked: true });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
