import mongoose, { Schema, model } from "mongoose";

// Define schema
const conversationSchema = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    { timestamps: true }
);

conversationSchema.pre("validate", function (next) {
    if (this.participants.length !== 2) {
        next(new Error("A conversation must have exactly two participants."));
    } else {
        // Always sort participant IDs as strings for consistency
        this.participants = this.participants.map(String).sort();
        next();
    }
});

// Compound unique index on both participants together
conversationSchema.index({ "participants.0": 1, "participants.1": 1 }, { unique: true });

// Create and export the model
const Conversation = mongoose.models.Conversation || model("Conversation", conversationSchema);

export default Conversation;
