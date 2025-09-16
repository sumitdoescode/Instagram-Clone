import User from "@/models/User";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// get user profile
export async function GET(req) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ clerkId: userId });

        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(loggedInUser._id),
                },
            },
            {
                $addFields: {
                    postsCount: { $size: "$posts" },
                    followersCount: { $size: "$followers" },
                    followingCount: { $size: "$following" },
                    bookmarksCount: { $size: "$bookmarks" },
                },
            },
            {
                $project: {
                    _id: 1,
                    clerkId: 1,
                    username: 1,
                    email: 1,
                    profileImage: 1,
                    bio: 1,
                    gender: 1,
                    postsCount: 1,
                    createdAt: 1,
                    followersCount: 1,
                    followingCount: 1,
                    bookmarksCount: 1,
                },
            },
        ]);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, user: user[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// update user profile
export async function PATCH(req) {
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

        const form = await req.formData();
        const username = form.get("username")?.trim() || "";
        const bio = form.get("bio")?.trim() || "";
        const gender = form.get("gender") || "";
        const profileImage = form.get("profileImage");

        // Always overwrite values (including empty string)
        user.username = username;
        user.bio = bio;
        user.gender = gender;

        if (profileImage && profileImage.size > 0) {
            const uploadResponse = await uploadOnCloudinary(profileImage);

            if (user.profileImage?.public_id) {
                await deleteFromCloudinary(user.profileImage.public_id);
            }

            user.profileImage = {
                url: uploadResponse.secure_url,
                public_id: uploadResponse.public_id,
            };
        }

        await user.save();
        const client = await clerkClient();
        await client.users.updateUser(userId, {
            username,
        });

        return NextResponse.json({ success: true, user, message: "Profile updated successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// delete user profile
export async function DELETE(req) {
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

        const client = await clerkClient(); // Await clerkClient instantiation
        await client.users.deleteUser(userId);
        // delete the user from clerk then user will be deleted from DB automatically

        return NextResponse.json({ success: true, message: "Clerk Profile deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
