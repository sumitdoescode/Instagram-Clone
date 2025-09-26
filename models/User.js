import mongoose, { Schema, model } from "mongoose";
import Post from "./Post";
import Comment from "./Comment";
import Message from "./Message";
import Conversation from "./Conversation";
import { deleteFromCloudinary } from "@/utils/cloudinary";

const userSchema = new Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            minlength: [3, "Username length should not be less than 3 characters"],
            maxlength: [16, "Username length should not exceed 16 characters"],
            match: /^[0-9A-Za-z]{3,16}$/,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        },
        profileImage: {
            url: {
                type: String,
                default: "",
            },
            public_id: {
                type: String,
                default: "",
            },
        },
        bio: {
            type: String,
            maxlength: [300, "Bio length should not exceed 300 characters"],
            default: "",
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            default: "male",
        },
        followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: Schema.Types.ObjectId, ref: "User" }],
        posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
        bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    },
    { timestamps: true }
);

userSchema.pre("findOneAndDelete", async function (next) {
    const user = await this.model.findOne(this.getQuery());
    if (!user) return next();

    try {
        // 1. Delete profile image from Cloudinary
        if (user.profileImage?.public_id) {
            await deleteFromCloudinary(user.profileImage.public_id);
        }

        // 2. Delete all posts by user (triggers postSchema.pre("remove"))
        const posts = await Post.find({ author: user._id });
        for (const post of posts) {
            await post.deleteOne();
        }

        // 3. Delete user comments and remove from posts
        const comments = await Comment.find({ author: user._id });
        for (const c of comments) {
            await c.deleteOne(); // ✅ triggers commentSchema middleware
        }

        // 4. Delete all messages where the user is sender or receiver
        await Message.deleteMany({
            $or: [{ senderId: user._id }, { receiverId: user._id }],
        });

        // 5. Delete the conversation where the user is participant
        await Conversation.deleteMany({
            participants: new mongoose.Types.ObjectId(user._id),
        });

        // 6. Remove userId from followers/following of other users
        await User.updateMany({ followers: user._id }, { $pull: { followers: user._id } });
        await User.updateMany({ following: user._id }, { $pull: { following: user._id } });

        // 7. Remove deletedUserId from likes of posts
        await Post.updateMany({ likes: user._id }, { $pull: { likes: user._id } });

        next();
    } catch (err) {
        console.error("Error in user pre-delete middleware:", err);
        next(err);
    }
});

const User = mongoose.models.User || model("User", userSchema);

export default User;
