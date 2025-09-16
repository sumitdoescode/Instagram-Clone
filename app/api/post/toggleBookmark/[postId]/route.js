import User from "@/models/User";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import Post from "@/models/Post";

// toggle Bookmark
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

        // Check if the post is already bookmarked by the user
        if (user.bookmarks.includes(post._id)) {
            // If already bookmarked, remove from bookmarks
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return NextResponse.json({ success: true, message: "Post removed from bookmarks", isBookmarked: false });
        } else {
            // If not bookmarked, add to bookmarks
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return NextResponse.json({ success: true, message: "Post added to bookmarks", isBookmarked: true });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
