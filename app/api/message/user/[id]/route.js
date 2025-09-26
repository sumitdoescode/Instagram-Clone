import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { pusherServer } from "@/lib/pusher";

// get messages
// GET /api/message/user/[id]
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

        const { id } = await params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        // Find the other user
        const otherUser = await User.findById(id).select("_id username email profileImage");
        if (!otherUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (otherUser._id.toString() === currentUser._id.toString()) {
            return NextResponse.json({ success: false, message: "You can't message yourself" }, { status: 400 });
        }

        // Step 1: Find the conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [currentUser._id, otherUser._id] },
        });

        // If no conversation → no messages
        if (!conversation) {
            return NextResponse.json(
                {
                    success: true,
                    user: otherUser,
                    messages: [],
                },
                { status: 200 }
            );
        }

        // Step 2: Get messages of that conversation
        const messages = await Message.find({
            conversationId: conversation._id,
        })
            .sort({ createdAt: 1 })
            .lean();

        // Step 3: Update unread messages (receiver is current user)
        await Message.updateMany({ conversationId: conversation._id, receiverId: currentUser._id }, { $set: { isRead: true } });

        // Step 4: Return both user + messages
        return NextResponse.json(
            {
                success: true,
                user: otherUser,
                messages,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// sendMessage
// POST /api/message/user/[id]
export async function POST(req, { params }) {
    try {
        await connectDB();
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const sender = await User.findOne({ clerkId: userId });
        if (!sender) {
            return NextResponse.json({ success: false, message: "sender not found" }, { status: 404 });
        }

        const { id } = await params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const receiver = await User.findById(id);
        if (!receiver) {
            return NextResponse.json({ success: false, message: "receiver not found" }, { status: 404 });
        }
        const { content } = (await req.json()) || {};
        if (!content) {
            return NextResponse.json({ success: false, message: "Content is required" }, { status: 400 });
        }

        // Step 1: Find or create the conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [sender._id, receiver._id] },
        });

        // If conversation doesn't exist, create it
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [sender._id, receiver._id],
            });
        }

        // Step 2: Create the message
        const messageObj = await Message.create({
            conversationId: conversation._id,
            senderId: sender._id,
            receiverId: receiver._id,
            content: content.trim(),
            isRead: false,
        });

        // Step 3: Update the last messae in the conversation
        conversation.lastMessage = messageObj._id;
        await conversation.save();

        // Step 4: Trigger Pusher event
        await pusherServer.trigger(`conversation-${conversation._id}`, "new-message", {
            _id: messageObj._id,
            content: messageObj.content,
            senderId: messageObj.senderId,
            receiverId: messageObj.receiverId,
            conversationId: messageObj.conversationId,
            createdAt: messageObj.createdAt,
        });

        // notify receiver’s unread count
        await pusherServer.trigger(`user-${receiver._id}`, "new-message", { conversationId: conversation._id });

        return NextResponse.json({ success: true, message: "Message sent successfully", conversationId: conversation._id, message: messageObj }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
