import mongoose, { model, Schema } from "mongoose";

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

// whenever a comment is deleted, remove it from the post's comments array
commentSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        await Post.updateOne({ _id: this.post }, { $pull: { comments: this._id } });
        next();
    } catch (err) {
        next(err);
    }
});

const Comment = mongoose.models.Comment || model("Comment", commentSchema);

export default Comment;
