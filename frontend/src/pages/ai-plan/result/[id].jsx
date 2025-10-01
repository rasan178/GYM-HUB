import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import api from "../../../utils/axiosInstance";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";
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
      <DashboardLayout>
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
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-black text-lg sm:text-xl mb-4 sm:mb-6 rounded-lg shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center mr-2 sm:mr-3 font-bold text-sm sm:text-base">
                  AI
                </div>
                AI PLAN RESULT
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase tracking-wider mb-3 sm:mb-4">
                {session.title}
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg shadow-lg">
                  {session.planType}
                </div>
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg border border-white/30">
                  Created: {new Date(session.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={uploadMorePlans}
              disabled={isUploadingPlans}
              className="flex-1 sm:flex-none bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isUploadingPlans ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating More Plans...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Generate More Plans</span>
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 sm:flex-none bg-gray-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg hover:bg-gray-600 transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ← Back to Plans
            </button>
          </div>

        {/* Generated Plan */}
        {session.plan && session.plan.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border-2 border-black mb-6 sm:mb-8">
            <div className="p-4 sm:p-6 border-b-2 border-black">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">Generated Plan</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {session.plan.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">{item.question || `Day ${idx + 1}`}</h3>
                  {typeof item.answer === "string" ? (
                    <p className="whitespace-pre-line text-gray-700 leading-relaxed text-sm sm:text-base">{item.answer}</p>
                  ) : Array.isArray(item.answer) ? (
                    <ul className="list-disc pl-4 sm:pl-5 text-gray-700 leading-relaxed text-sm sm:text-base">
                      {item.answer.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base">No answer available.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Section */}
        {session.questions?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border-2 border-black">
            <div className="p-4 sm:p-6 border-b-2 border-black">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">Questions & Answers</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden border-2 border-black">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-black">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Concept Explanation</h3>
                <button onClick={closeLearnMoreDrawer} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh]">
                {isLoadingExplanation ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 text-sm sm:text-base">Generating explanation...</span>
                    </div>
                  </div>
                ) : errorMsg ? (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4">
                    <p className="text-red-700 text-sm sm:text-base">{errorMsg}</p>
                  </div>
                ) : explanation ? (
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm sm:text-base">
                    {explanation.recommendation && <p>{explanation.recommendation}</p>}
                    {explanation.steps && explanation.steps.length > 0 && (
                      <ul className="list-disc pl-4 sm:pl-5 mt-2">
                        {explanation.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No explanation available.</p>
                )}
              </div>
              {!isLoadingExplanation && !errorMsg && explanation && (
                <div className="p-4 sm:p-6 border-t-2 border-black bg-gray-50">
                  <button
                    onClick={closeLearnMoreDrawer}
                    className="w-full bg-blue-500 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium"
                  >
                    Got it, thanks!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIPlanResult;
