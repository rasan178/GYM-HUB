const Session = require("../models/Session");
const Question = require("../models/Question");

// Create a new session (Workout or Diet)
exports.createSession = async (req, res) => {
  try {
    const { planType, title, inputs, questions } = req.body;
    const userId = req.user._id;

    if (!planType || !inputs || !title) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    const session = await Session.create({
      user: userId,
      planType,
      inputs,
      description: title,
    });

    // Only create questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionDocs = await Promise.all(
        questions.map(async (q) => {
          const question = await Question.create({
            session: session._id,
            question: q.question,
            answer: q.answer,
          });
          return question._id;
        })
      );
      session.questions = questionDocs;
      await session.save();
    }

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error("Create Session Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all sessions of logged-in user
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("questions");
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .exec();

    if (!session)
      return res.status(404).json({ success: false, message: "Session not found" });

    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    if (session.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await Question.deleteMany({ session: session._id });
    await session.deleteOne();

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
