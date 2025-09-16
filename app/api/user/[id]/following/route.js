import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// get user's following
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const loggedInUser = await User.findOne({ clerkId: userId });
        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: "loggedInUser not found" }, { status: 404 });
        }
        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found by provdided Id" }, { status: 404 });
        }

        const following = await User.aggregate([
            {
                // Match the target user
                $match: { _id: new mongoose.Types.ObjectId(user._id) },
            },
            {
                // Lookup the users they are following
                $lookup: {
                    from: "users",
                    localField: "following",
                    foreignField: "_id",
                    as: "followingUsers",
                },
            },
            {
                // Unwind each following user
                $unwind: "$followingUsers",
            },
            {
                // Project required fields
                $project: {
                    _id: "$followingUsers._id",
                    username: "$followingUsers.username",
                    profileImage: "$followingUsers.profileImage",
                    followersCount: { $size: "$followingUsers.followers" },
                    isFollowing: {
                        $in: [loggedInUser._id, "$followingUsers.followers"],
                    },
                    isOwnProfile: { $eq: ["$followingUsers._id", loggedInUser._id] },
                },
            },
        ]);
        return NextResponse.json({ success: true, following }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
