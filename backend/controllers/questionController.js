const Question = require("../models/Question");
const Session = require("../models/Session");

// Add questions to session
exports.addQuestionsToSession = async (req, res) => {
    try {
        const { sessionId, questions } = req.body;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        const createdQuestions = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session: sessionId,
                    question: q.question,
                    answer: q.answer,
                });
                return question._id;
            })
        );

        session.questions.push(...createdQuestions);
        await session.save();

        res.status(201).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Toggle pin
exports.togglePinQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: "Question not found" });

        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update note
exports.updateQuestionNote = async (req, res) => {
    try {
        const { note } = req.body;
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: "Question not found" });

        question.note = note;
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
