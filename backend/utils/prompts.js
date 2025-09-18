const workoutPlanPrompt = ( 
    age, gender, height, weight,
    fitnessGoal, experienceLevel,
    healthConditions, workoutAvailability,
    numberOfDays
) => `
You are an AI fitness coach.

Task:
- Generate a personalized workout plan.
- Inputs:
    - Age: ${age}
    - Gender: ${gender}
    - Height: ${height} cm
    - Weight: ${weight} kg
    - Fitness Goal: ${fitnessGoal}
    - Experience Level: ${experienceLevel}
    - Health Conditions/Injuries: ${healthConditions || "None"}
    - Workout Availability: ${workoutAvailability}
    - Number of Days: ${numberOfDays}

- Write ${numberOfDays} day-based workout schedules.
- Each day should contain multiple exercises with sets, reps, and optional notes.
- Provide a clear overview and extra recommendations.

Return a pure JSON array like this:
[
    {
        "question": "Day 1 Workout Plan",
        "answer": "Detailed workout schedule for Day 1"
    },
    ...
]
Important: Only return valid JSON.
`;

const dietPlanPrompt = (
    eatingHabits, activityLevel, caloriePreference,
    supplementUse, budgetLifestyle
) => `
You are an AI nutritionist.

Task:
- Generate a personalized **daily diet plan**.
- Inputs:
    - Eating Habits: ${eatingHabits}
    - Daily Activity Level: ${activityLevel}
    - Calorie Preference: ${caloriePreference}
    - Supplement Use: ${supplementUse || "None"}
    - Budget & Lifestyle: ${budgetLifestyle}

- Write a **single daily diet schedule**.
- Include meals (breakfast, lunch, dinner, snacks).
- Provide a clear overview and extra recommendations.

Return a pure JSON object like this:
{
    
    "Detailed diet schedule for the day"
    
}
Important: Only return valid JSON.
`;

const generatePlanExplanationPrompt = (planType, inputs) => `
You are a helpful AI fitness coach. Generate a personalized plan explanation.

Task:
- Plan Type: ${planType}
- User Inputs: ${JSON.stringify(inputs)}

Output only valid JSON:
{
    "planType": "${planType}",
    "inputs": ${JSON.stringify(inputs)},
    "recommendation": "short overview",
    "steps": ["Step 1...", "Step 2...", ...]
}
Important: Only return JSON.
`;

module.exports = { workoutPlanPrompt, dietPlanPrompt, generatePlanExplanationPrompt };
