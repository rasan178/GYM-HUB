import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import TextInput from "../Inputs/TextInput";
import SelectInput from "../Inputs/SelectInput";
import SpinnerLoader from "../Loaders/SpinnerLoader";
import api from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CreateAIPlanForm = ({ onSuccess, onClose }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    planType: "Workout",
    title: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitnessGoal: "",
    experienceLevel: "",
    healthConditions: "",
    workoutAvailability: "",
    numberOfDays: "",
    eatingHabits: "",
    activityLevel: "",
    caloriePreference: "",
    supplementUse: "",
    budgetLifestyle: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper: normalize an "answer" into either string or array-of-strings
  const normalizeAnswer = (ans) => {
    if (typeof ans === "string") return ans;
    if (Array.isArray(ans)) {
      // convert nested objects/arrays to readable strings
      return ans.map((a) => (typeof a === "string" ? a : JSON.stringify(a, null, 2)));
    }
    if (typeof ans === "object" && ans !== null) {
      // produce readable lines for object
      // If it's a map of days/meals, produce an array of lines
      const lines = [];
      for (const [k, v] of Object.entries(ans)) {
        if (typeof v === "string") {
          lines.push(`${k}: ${v}`);
        } else {
          lines.push(`${k}: ${JSON.stringify(v, null, 2)}`);
        }
      }
      return lines;
    }
    return String(ans);
  };

  // Transform diet-object response into an array of {question, answer}
  const transformDietResponseToQA = (data) => {
    const qa = [];

    // 1) Common top-level overview/summary fields
    if (data.overview) {
      qa.push({ question: "Overview", answer: normalizeAnswer(data.overview) });
    }
    if (data.description) {
      qa.push({ question: "Description", answer: normalizeAnswer(data.description) });
    }
    if (data.daily_schedule) {
      // daily_schedule could be an object with keys like Day 1 or Mon, or an array
      const ds = data.daily_schedule;
      if (Array.isArray(ds)) {
        ds.forEach((d, idx) => {
          qa.push({ question: d.title || `Day ${idx + 1}`, answer: normalizeAnswer(d) });
        });
      } else if (typeof ds === "object" && ds !== null) {
        // if keys are days: push each
        for (const [k, v] of Object.entries(ds)) {
          qa.push({ question: k, answer: normalizeAnswer(v) });
        }
      } else {
        qa.push({ question: "Daily Schedule", answer: normalizeAnswer(ds) });
      }
    }

    // 2) Generic schedule or meals structure
    if (data.schedule) {
      const sc = data.schedule;
      if (Array.isArray(sc)) {
        sc.forEach((s, idx) => {
          // try to find a label
          const title = s.day || s.title || `Schedule ${idx + 1}`;
          qa.push({ question: title, answer: normalizeAnswer(s) });
        });
      } else if (typeof sc === "object" && sc !== null) {
        for (const [k, v] of Object.entries(sc)) {
          qa.push({ question: k, answer: normalizeAnswer(v) });
        }
      } else {
        qa.push({ question: "Schedule", answer: normalizeAnswer(sc) });
      }
    }

    // 3) If there are explicit mealBreakdown / meals keys
    if (data.meals || data.mealPlan || data.meal_breakdown) {
      const meals = data.meals || data.mealPlan || data.meal_breakdown;
      if (Array.isArray(meals)) {
        meals.forEach((m, idx) => qa.push({ question: m.title || `Meal ${idx + 1}`, answer: normalizeAnswer(m) }));
      } else {
        qa.push({ question: "Meals", answer: normalizeAnswer(meals) });
      }
    }

    // 4) Any other useful top-level fields
    const usedKeys = new Set(["overview", "description", "daily_schedule", "schedule", "meals", "mealPlan", "meal_breakdown"]);
    for (const [k, v] of Object.entries(data)) {
      if (usedKeys.has(k)) continue;
      // if value is primitive or small, include it
      qa.push({ question: k, answer: normalizeAnswer(v) });
    }

    // If no QA items were produced (defensive), push the full object as a single item
    if (qa.length === 0) {
      qa.push({ question: "Diet Plan", answer: normalizeAnswer(data) });
    }

    return qa;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let generatedPlan = [];

      if (formData.planType === "Workout") {
        const res = await api.post(API_PATHS.AI.GENERATE_WORKOUT, {
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          fitnessGoal: formData.fitnessGoal,
          experienceLevel: formData.experienceLevel,
          healthConditions: formData.healthConditions,
          workoutAvailability: formData.workoutAvailability,
          numberOfDays: formData.numberOfDays,
        });

        generatedPlan = res.data;
      } else if (formData.planType === "Diet") {
        const res = await api.post(API_PATHS.AI.GENERATE_DIET, {
          eatingHabits: formData.eatingHabits,
          activityLevel: formData.activityLevel,
          caloriePreference: formData.caloriePreference,
          supplementUse: formData.supplementUse,
          budgetLifestyle: formData.budgetLifestyle,
        });

        const aiData = res.data;

        // If already an array, accept it
        if (Array.isArray(aiData)) {
          generatedPlan = aiData;
        } else if (aiData && typeof aiData === "object") {
          // transform object to array of Q&A for consistent downstream behavior
          generatedPlan = transformDietResponseToQA(aiData);
        } else {
          // fallback: convert primitive to single answer
          generatedPlan = [{ question: "Diet Plan", answer: String(aiData) }];
        }
      }

      // Accept either array or object transformed above. Only consider "empty" if array and length 0
      if (!generatedPlan || (Array.isArray(generatedPlan) && generatedPlan.length === 0)) {
        toast.error("AI plan generation returned no data");
        setLoading(false);
        return;
      }

      // Create session with questions array
      const sessionRes = await api.post(API_PATHS.SESSIONS.CREATE, {
        planType: formData.planType,
        title: formData.title,
        questions: generatedPlan,
        inputs: formData,
      });

      const sessionId = sessionRes.data.session._id;
      toast.success("AI Plan created successfully!");
      onSuccess();
      router.push(`/ai-plan/result/${sessionId}`);
    } catch (err) {
      console.error("AI Plan creation error:", err.response || err);
      toast.error(err.response?.data?.message || "Failed to create AI Plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="relative bg-white rounded-xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          <IoClose />
        </button>

        <h3 className="text-lg font-semibold text-center">Create AI Plan</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
          <SelectInput
            label="Plan Type"
            name="planType"
            options={[
              { value: "Workout", label: "Workout" },
              { value: "Diet", label: "Diet" },
            ]}
            value={formData.planType}
            onChange={handleChange}
          />
          <TextInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          {formData.planType === "Workout" ? (
            <>
              <TextInput label="Age" name="age" value={formData.age} onChange={handleChange} />
              <SelectInput
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
              />
              <TextInput label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
              <TextInput label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
              <TextInput label="Fitness Goal" name="fitnessGoal" value={formData.fitnessGoal} onChange={handleChange} />
              <SelectInput
                label="Experience Level"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                options={[
                  { value: "Beginner", label: "Beginner" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Advanced", label: "Advanced" },
                ]}
              />
              <TextInput label="Health Conditions" name="healthConditions" value={formData.healthConditions} onChange={handleChange} />
              <TextInput label="Workout Availability" name="workoutAvailability" value={formData.workoutAvailability} onChange={handleChange} />
              <TextInput label="Number of Days/Week" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} />
            </>
          ) : (
            <>
              <TextInput label="Eating Habits" name="eatingHabits" value={formData.eatingHabits} onChange={handleChange} />
              <TextInput label="Activity Level" name="activityLevel" value={formData.activityLevel} onChange={handleChange} />
              <TextInput label="Calorie Preference" name="caloriePreference" value={formData.caloriePreference} onChange={handleChange} />
              <TextInput label="Supplement Use" name="supplementUse" value={formData.supplementUse} onChange={handleChange} />
              <TextInput label="Budget & Lifestyle" name="budgetLifestyle" value={formData.budgetLifestyle} onChange={handleChange} />
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary mt-4 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? <SpinnerLoader /> : "Create Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAIPlanForm;
