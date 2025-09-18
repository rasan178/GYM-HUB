const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
        question: String,
        answer: { type: mongoose.Schema.Types.Mixed, required: true },
        note: String,
        isPinned: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
