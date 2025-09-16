import User from "@/models/User";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

// get recommended users
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

        // 2. Get list of user IDs to exclude: people they're already following + themselves
        const excludedIds = [...user.following, user._id];

        // 3. Get 5 random users not in that exclusion list
        const recommendedUsers = await User.aggregate([
            {
                $match: {
                    _id: { $nin: excludedIds },
                },
            },
            { $sample: { size: 5 } },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    profileImage: 1,
                    bio: 1,
                    gender: 1,
                    followersCount: {
                        $size: "$followers",
                    },
                },
            },
        ]);

        return NextResponse.json({ success: true, recommendedUsers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
