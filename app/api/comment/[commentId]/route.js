import User from "@/models/User";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import Post from "@/models/Post";
import Comment from "@/models/Comment";

// delete a comment
// DELETE /api/comment/[commentId]
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
        const { commentId } = params;
        if (!isValidObjectId(commentId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
        }

        // Check if the user is the author of the comment
        if (comment.author.toString() !== user._id.toString()) {
            throw new ApiError(403, "Unauthorized: You can only delete your own comment");
        }

        // Remove comment from post's comments array
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: comment._id },
        });

        // Delete the comment
        await comment.deleteOne();

        return NextResponse.json({ success: true, message: "Comment deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
