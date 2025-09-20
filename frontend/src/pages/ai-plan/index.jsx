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
      <div className="container mx-auto pt-4 pb-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-500">No AI Plans available. Create a new one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6">
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
        )}

        {/* Add New AI Plan Button */}
        <button
          className="fixed bottom-10 right-10 h-12 flex items-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-2xl z-50"
          onClick={() => setOpenCreateModal(true)}
        >
          <LuPlus className="text-2xl" /> Add New
        </button>
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
