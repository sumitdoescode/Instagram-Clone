import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// follow or unfollow a user by it's id
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await User.findOne({ clerkId: userId });
        if (!currentUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const targetUser = await User.findById(id);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // ⛔ Prevent following yourself
        if (currentUser._id.equals(targetUser._id)) {
            return NextResponse.json({ success: false, message: "You cannot follow yourself" }, { status: 400 });
        }

        // 🔁 Check if you're already following the user
        const isAlreadyFollowing = currentUser.following.includes(targetUser._id);

        if (isAlreadyFollowing) {
            // 🔄 Unfollow
            await User.findByIdAndUpdate(currentUser._id, {
                $pull: { following: targetUser._id },
            });

            await User.findByIdAndUpdate(targetUser._id, {
                $pull: { followers: currentUser._id },
            });

            return NextResponse.json({ success: true, message: "User unfollowed successfully", isFollow: false });
        } else {
            // ➕ Follow
            await User.findByIdAndUpdate(currentUser._id, {
                $addToSet: { following: targetUser._id },
            });

            await User.findByIdAndUpdate(targetUser._id, {
                $addToSet: { followers: currentUser._id },
            });

            return NextResponse.json({ success: true, message: "User followed successfully", isFollow: true });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
