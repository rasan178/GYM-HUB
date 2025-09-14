const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planType: { type: String, enum: ["Workout", "Diet"], required: true }, // Capitalized
    inputs: { type: Object, required: true }, // Store all user inputs
    description: { type: String, required: true }, // mapped from 'title'
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
