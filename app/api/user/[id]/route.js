import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// get user profile by id
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const loggedInUser = await User.findOne({ clerkId: userId });
        if (!loggedInUser) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        const { id } = params;
        if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        // const user = await User.findById(id);

        const user = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $addFields: {
                    followersCount: { $size: "$followers" },
                    followingCount: { $size: "$following" },
                    postsCount: { $size: "$posts" },
                    isOwner: { $eq: ["$_id", loggedInUser._id] },
                    isFollowing: { $in: [loggedInUser._id, "$followers"] }, // no lookup needed, array of IDs hai
                },
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    profileImage: 1,
                    bio: 1,
                    gender: 1,
                    followersCount: 1,
                    followingCount: 1,
                    postsCount: 1,
                    isOwner: 1,
                    isFollowing: 1,
                },
            },
        ]);
        if (!user.length) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, user: user[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
