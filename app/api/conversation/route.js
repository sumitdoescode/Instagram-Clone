import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Conversation from "@/models/Conversation";

// get all conversations of logged in user
// GET /api/conversation
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

        const conversations = await Conversation.aggregate([
            // Match conversations where user is a participant
            { $match: { participants: user._id } },

            // Sort by latest update
            { $sort: { updatedAt: -1 } },

            // Lookup lastMessage details
            {
                $lookup: {
                    from: "messages",
                    localField: "lastMessage",
                    foreignField: "_id",
                    as: "lastMessage",
                },
            },
            { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },

            // Lookup all messages in this conversation
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "conversationId",
                    as: "allMessages",
                },
            },

            // Lookup participant details
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participants",
                },
            },

            // Add "other participant" and unread count
            {
                $addFields: {
                    participant: {
                        $first: {
                            $filter: {
                                input: "$participants",
                                as: "p",
                                cond: { $ne: ["$$p._id", user._id] },
                            },
                        },
                    },
                    unreadMessages: {
                        $size: {
                            $filter: {
                                input: "$allMessages",
                                as: "m",
                                cond: {
                                    $and: [
                                        { $eq: ["$$m.isRead", false] },
                                        { $eq: ["$$m.receiverId", user._id] }, // both are ObjectId
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            // Final shape
            {
                $project: {
                    _id: 1,
                    updatedAt: 1,
                    lastMessage: "$lastMessage.content",
                    unreadMessages: 1,
                    participant: {
                        _id: 1,
                        username: 1,
                        email: 1,
                        profileImage: 1,
                    },
                    currentUserId: user._id,
                },
            },
        ]);

        return NextResponse.json({ success: true, conversations }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
