const { GoogleGenAI } = require("@google/genai");
const { workoutPlanPrompt, dietPlanPrompt, generatePlanExplanationPrompt } = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ========================== Generate Workout Plan ==========================
exports.generateWorkoutPlan = async (req, res) => {
    try {
        const { 
            age, 
            gender, 
            height, 
            weight, 
            fitnessGoal, 
            experienceLevel, 
            healthConditions, 
            workoutAvailability, 
            numberOfDays 
        } = req.body;

        if (
            !age || !gender || !height || !weight || 
            !fitnessGoal || !experienceLevel || 
            !workoutAvailability || !numberOfDays
        ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = workoutPlanPrompt(
            age, gender, height, weight, 
            fitnessGoal, experienceLevel, 
            healthConditions, workoutAvailability, numberOfDays
        );

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        let rawText = response.text;
        const cleaned = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const data = JSON.parse(cleaned);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate workout plan", error: error.message });
    }
};

// ========================== Generate Diet Plan ==========================
exports.generateDietPlan = async (req, res) => {
    try {
        const { 
            eatingHabits, 
            activityLevel, 
            caloriePreference, 
            supplementUse, 
            budgetLifestyle 
        } = req.body;

        if (!eatingHabits || !activityLevel || !caloriePreference || !budgetLifestyle) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = dietPlanPrompt(
            eatingHabits, activityLevel, 
            caloriePreference, supplementUse, budgetLifestyle
        );

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        let rawText = response.text;
        const cleaned = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const data = JSON.parse(cleaned);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate diet plan", error: error.message });
    }
};

// ========================== Generate Plan Explanation ==========================
exports.generatePlanExplanation = async (req, res) => {
    try {
        const { planType, inputs } = req.body;

        if (!planType || !inputs) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = generatePlanExplanationPrompt(planType, inputs);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        let rawText = response.text;
        const cleaned = rawText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
        const data = JSON.parse(cleaned);

        res.status(200).json({ success: true, explanation: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to generate plan explanation", error: error.message });
    }
};
