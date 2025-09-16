import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// get user's followers
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

        const followers = await User.aggregate([
            {
                // Match the target user whose followers we want
                $match: { _id: new mongoose.Types.ObjectId(user._id) },
            },
            {
                // Lookup their followers (returns array of User docs)
                $lookup: {
                    from: "users",
                    localField: "followers",
                    foreignField: "_id",
                    as: "followerUsers",
                },
            },
            {
                // Unwind the followers array to process each follower separately
                $unwind: "$followerUsers",
            },
            {
                // Project the required fields + isFollowing + followersCount
                $project: {
                    _id: "$followerUsers._id",
                    username: "$followerUsers.username",
                    profileImage: "$followerUsers.profileImage",
                    followersCount: { $size: "$followerUsers.followers" },
                    isFollowing: {
                        $in: [loggedInUser._id, "$followerUsers.followers"],
                    },
                    isOwnProfile: { $eq: ["$followerUsers._id", loggedInUser._id] },
                },
            },
        ]);

        return NextResponse.json({ success: true, followers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
