import User from "@/models/User";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

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
        const { searchParams } = new URL(req.url);
        let query = searchParams.get("query");
        if (!query) {
            return NextResponse.json({ success: false, message: "No query provided" }, { status: 400 });
        }
        query = query.trim().toLowerCase();
        query = query.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters

        const searchResults = await User.aggregate([
            {
                $match: {
                    $or: [{ username: { $regex: query, $options: "i" } }],
                },
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    profileImage: 1,
                    bio: 1,
                    gender: 1,
                    followersCount: 1, // Add this if you want to sort by it
                },
            },
            {
                $sort: { followersCount: -1 },
            },
        ]);
        return NextResponse.json({ success: true, searchResults }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
