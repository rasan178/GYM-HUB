import { useState, useEffect } from "react";
import { LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import moment from "moment";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useRouter } from "next/router";
import { API_PATHS } from "../../utils/apiPaths";
import api from "../../utils/axiosInstance";
import { CARD_BG } from "../../utils/data";
import SummaryCard from "../../components/Cards/SummaryCard";
import Modal from "../../components/Modal";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import CreateAIPlanForm from "../../components/Forms/CreateAIPlanForm";

const AIPlan = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ open: false, data: null });

  // Fetch all AI plan sessions
  const fetchAllSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_PATHS.SESSIONS.GET_MY);
      setSessions(res.data || []);
    } catch (error) {
      console.error("Error fetching AI plan sessions:", error);
      toast.error("Failed to fetch AI plans");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete AI plan session
  const deleteSession = async (session) => {
    if (!session?._id) return;
    try {
      await api.delete(API_PATHS.SESSIONS.DELETE(session._id));
      toast.success("Session deleted successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-black text-lg sm:text-xl mb-4 sm:mb-6 rounded-lg shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center mr-2 sm:mr-3 font-bold text-sm sm:text-base">
                  AI
                </div>
                AI FITNESS PLANS
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-wider mb-3 sm:mb-4">
                Smart Workouts
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 font-medium max-w-3xl mx-auto mb-4 sm:mb-6">
                Get personalized AI-powered fitness plans tailored to your goals and schedule
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <div className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg shadow-lg">
                  {sessions.length} Plans Created
                </div>
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg border border-white/30">
                  AI-Powered
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto pt-6 sm:pt-8 pb-4 px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg shadow-lg">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Loading AI Plans...
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white border-2 sm:border-4 border-black p-6 sm:p-8 rounded-lg shadow-lg max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <LuPlus className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-wide mb-2 sm:mb-3">
                  No AI Plans Yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium mb-4 sm:mb-6">
                  Create your first personalized AI fitness plan to get started!
                </p>
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 font-black uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create First Plan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {sessions.map((session, index) => (
                  <SummaryCard
                    key={session._id}
                    colors={CARD_BG[index % CARD_BG.length]}
                    title={session.inputs.title || ""}
                    fitnessGoal={session.inputs.fitnessGoal || ""}
                    planType={session.planType || "-"}
                    workoutAvailability={session.inputs.workoutAvailability || ""}
                    questions={session.questions?.length || "-"}
                    lastUpdated={session.updatedAt ? moment(session.updatedAt).format("Do MMM YYYY") : "-"}
                    onSelect={() => router.push(`/ai-plan/result/${session._id}`)}
                    onDelete={() => setOpenDeleteAlert({ open: true, data: session })}
                  />
                ))}
              </div>

              {/* Stats Section */}
              <div className="mt-8 sm:mt-12 bg-gray-50 border-2 border-gray-200 p-4 sm:p-6 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-black mb-1 sm:mb-2">
                      {sessions.length}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wide">
                      Total Plans
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-black mb-1 sm:mb-2">
                      {sessions.reduce((acc, session) => acc + (session.questions?.length || 0), 0)}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wide">
                      Questions Answered
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-black mb-1 sm:mb-2">
                      {sessions.filter(s => s.planType === 'workout').length}
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-gray-600 uppercase tracking-wide">
                      Workout Plans
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Enhanced Floating Action Button */}
          <button
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 h-12 sm:h-14 w-12 sm:w-14 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-2xl hover:shadow-3xl z-50 text-lg sm:text-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            onClick={() => setOpenCreateModal(true)}
            title="Create New AI Plan"
          >
            <LuPlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* Create AI Plan Modal */}
      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} hideHeader>
        <CreateAIPlanForm
          onSuccess={() => {
            fetchAllSessions();
            setOpenCreateModal(false);
          }}
          onClose={() => setOpenCreateModal(false)} // pass close handler to form
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteAlert.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Plan"
      >
        <DeleteAlertContent
          content="Are you sure you want to delete this AI plan?"
          onDelete={() => deleteSession(openDeleteAlert.data)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default AIPlan;
