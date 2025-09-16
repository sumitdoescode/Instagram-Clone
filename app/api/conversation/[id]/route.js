import User from "@/models/User";
import { uploadOnCloudinary } from "@/utils/cloudinary";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

// get conversation by id
// GET /api/conversation/[id]
// export async function GET(req, { params }) {
//     try {
//         await connectDB();
//         const { userId } = await auth();
//         if (!userId) {
//             return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//         }

//         const user = await User.findOne({ clerkId: userId });
//         if (!user) {
//             return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
//         }

//         const { id } = params;
//         if (!isValidObjectId(id)) {
//             return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
//         }

//         // Find the conversation
//         const conversation = await Conversation.findOne({
//             _id: id,
//             participants: user._id,
//         }).populate("participants", "_id username email profileImage");

//         if (!conversation) {
//             return NextResponse.json({ success: false, message: "Conversation not found" }, { status: 404 });
//         }

//         // Get the "other" participant (exclude current user)
//         const participant = conversation.participants.find((p) => !p._id.equals(user._id));

//         // Fetch all messages for this conversation
//         const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).lean();

//         // Mark as read where receiver is current user
//         await Message.updateMany({ conversationId: conversation._id, receiverId: user._id }, { $set: { isRead: true } });

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Conversation fetched successfully",
//                 conversation: {
//                     _id: conversation._id,
//                     updatedAt: conversation.updatedAt,
//                     participant, // other user info
//                     messages,
//                 },
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
//     }
// }

// delete conversation by id
// DELETE /api/conversation/[id]
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

        const { id } = params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return NextResponse.json({ success: false, message: "Conversation not found" }, { status: 404 });
        }

        // Check if the user is a participant in the conversation
        if (!conversation.participants.includes(user._id)) {
            throw new ApiError(403, "Unauthorized: You can only delete your own conversation");
        }

        // Delete all messages in the conversation
        await Message.deleteMany({ conversationId: conversation._id });
        await Conversation.findByIdAndDelete(conversation._id);

        return NextResponse.json({ success: true, message: "Conversation deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}

// mark message as read of a conversation
// PATCH /api/conversation/[id]
export async function PATCH(req, { params }) {
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

        const { id } = await params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return NextResponse.json({ success: false, message: "Conversation not found" }, { status: 404 });
        }

        // Check if the user is a participant in the conversation
        if (!conversation.participants.includes(user._id)) {
            throw new ApiError(403, "Unauthorized: You can only delete your own conversation");
        }

        // Mark all messages as read
        await Message.updateMany({ conversationId: conversation._id }, { $set: { isRead: true } });

        return NextResponse.json({ success: true, message: "Conversation marked as read successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
    }
}
