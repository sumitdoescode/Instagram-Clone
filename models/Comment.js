import mongoose, { model, Schema } from "mongoose";
import Post from "./Post";

const commentSchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
    },
    { timestamps: true }
);

// single document delete
commentSchema.pre("deleteOne", { document: true }, async function (next) {
    try {
        await Post.updateOne({ _id: this.post }, { $pull: { comments: this._id } });
        next();
    } catch (err) {
        next(err);
    }
});

// handle findOneAndDelete too
commentSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Post.updateOne({ _id: doc.post }, { $pull: { comments: doc._id } });
    }
});
const Comment = mongoose.models.Comment || model("Comment", commentSchema);

export default Comment;
