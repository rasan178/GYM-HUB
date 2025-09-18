import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import api from "../../../utils/axiosInstance";
import MainLayout from "../../../components/Layouts/MainLayout";
import SpinnerLoader from "../../../components/Loaders/SpinnerLoader";
import { API_PATHS } from "../../../utils/apiPaths";
import QuestionCard from "../../../components/Cards/QuestionCard.jsx";

const AIPlanResult = () => {
  const router = useRouter();
  const { id } = router.query;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isUploadingPlans, setIsUploadingPlans] = useState(false);

  // Fetch session
  const fetchSession = async () => {
    try {
      const res = await api.get(API_PATHS.SESSIONS.GET_ONE(id));
      setSession(res.data.session);
    } catch (err) {
      toast.error("Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  // Toggle question pin
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const res = await api.post(API_PATHS.QUESTIONS.PIN(questionId));
      if (res.data?.question) {
        fetchSession();
        toast.success("Question pin status updated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pin status");
    }
  };

  // Generate Concept Explanation
  const generateConceptExplanation = async (questionText) => {
    if (!session) return;

    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoadingExplanation(true);
      setOpenLearnMoreDrawer(true);

      const res = await api.post(API_PATHS.AI.GENERATE_EXPLANATION, {
        planType: session.planType,
        inputs: { question: questionText, sessionDetails: session },
      });

      if (res.data?.success) {
        setExplanation(res.data.explanation);
      } else {
        setErrorMsg(res.data?.message || "Failed to generate explanation.");
      }
    } catch (err) {
      console.error(err);
      setExplanation(null);
      setErrorMsg("Failed to generate explanation.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Upload More Plans and save to session
  const uploadMorePlans = async () => {
    if (!session) return;

    try {
      setIsUploadingPlans(true);

      let apiEndpoint;
      let payload = {};

      if (["workout", "fitness"].includes(session.planType?.toLowerCase())) {
        apiEndpoint = API_PATHS.AI.GENERATE_WORKOUT;
        payload = {
          age: session.age || 25,
          gender: session.gender || "male",
          height: session.height || 170,
          weight: session.weight || 70,
          fitnessGoal: session.goals?.[0] || "general_fitness",
          experienceLevel: session.fitnessLevel || "beginner",
          healthConditions: session.healthConditions || [],
          workoutAvailability: session.workoutAvailability || ["monday", "wednesday", "friday"],
          numberOfDays: session.duration || 3,
          sessionId: id,
          userId: session.userId || session.user?._id,
          generateMore: true,
        };
      } else if (["diet", "nutrition"].includes(session.planType?.toLowerCase())) {
        apiEndpoint = API_PATHS.AI.GENERATE_DIET;
        payload = {
          eatingHabits: session.eatingHabits || "balanced",
          activityLevel: session.activityLevel || "moderate",
          caloriePreference: session.calories || 2000,
          supplementUse: session.supplementUse || [],
          budgetLifestyle: session.budgetLifestyle || "medium",
          sessionId: id,
          userId: session.userId || session.user?._id,
          generateMore: true,
        };
      } else {
        throw new Error(`Unsupported plan type: ${session.planType}`);
      }

      // Step 1: Generate new plans from AI
      const aiResponse = await api.post(apiEndpoint, payload);

      if (!aiResponse.data || !Array.isArray(aiResponse.data) || aiResponse.data.length === 0) {
        toast.error("Failed to generate additional plans");
        return;
      }

      const generatedQuestions = aiResponse.data; // [{question, answer}, ...]

      // Step 2: Save generated plans to session in backend
      const saveResponse = await api.post(API_PATHS.QUESTIONS.ADD_TO_SESSION, {
        sessionId: id,
        questions: generatedQuestions,
      });

      if (saveResponse.data) {
        toast.success("Added More Q & A!!");
        fetchSession(); // Refresh session to show saved plans
      } else {
        toast.error("Failed to save generated plans to session");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsUploadingPlans(false);
    }
  };

  const closeLearnMoreDrawer = () => {
    setOpenLearnMoreDrawer(false);
    setExplanation(null);
    setErrorMsg("");
  };

  useEffect(() => {
    if (id) fetchSession();
  }, [id]);

  if (loading) return <SpinnerLoader />;

  if (!session)
    return (
      <MainLayout>
        <div className="text-center mt-10">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Session Not Found</h2>
          <p className="text-gray-500">The requested session could not be found.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {session.planType}
              </span>
              <span className="text-sm text-gray-500">Created: {new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={uploadMorePlans}
              disabled={isUploadingPlans}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploadingPlans ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Generate More
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* Generated Plan */}
        {session.plan && session.plan.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">Generated Plan</h2>
            </div>
            <div className="p-6 space-y-6">
              {session.plan.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.question || `Day ${idx + 1}`}</h3>
                  {typeof item.answer === "string" ? (
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed">{item.answer}</p>
                  ) : Array.isArray(item.answer) ? (
                    <ul className="list-disc pl-5 text-gray-700 leading-relaxed">
                      {item.answer.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No answer available.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Section */}
        {session.questions?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">Questions & Answers</h2>
            </div>
            <div className="p-6 space-y-4">
              {session.questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q.question}
                  answer={q.answer}
                  isPinned={q.isPinned}
                  onTogglePin={() => toggleQuestionPinStatus(q._id)}
                  onLearnMore={() => generateConceptExplanation(q.question)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Explanation Drawer */}
        {openLearnMoreDrawer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">Concept Explanation</h3>
                <button onClick={closeLearnMoreDrawer} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {isLoadingExplanation ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Generating explanation...</span>
                    </div>
                  </div>
                ) : errorMsg ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{errorMsg}</p>
                  </div>
                ) : explanation ? (
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {explanation.recommendation && <p>{explanation.recommendation}</p>}
                    {explanation.steps && explanation.steps.length > 0 && (
                      <ul className="list-disc pl-5 mt-2">
                        {explanation.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No explanation available.</p>
                )}
              </div>
              {!isLoadingExplanation && !errorMsg && explanation && (
                <div className="p-6 border-t bg-gray-50">
                  <button
                    onClick={closeLearnMoreDrawer}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Got it, thanks!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AIPlanResult;
