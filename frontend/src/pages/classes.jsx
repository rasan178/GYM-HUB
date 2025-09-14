import { useEffect, useState, useContext } from "react";
import api from "../utils/axiosInstance";
import MainLayout from "../components/Layouts/MainLayout";
import AuthContext from "../context/AuthContext";
import { formatTime } from "../utils/helpers";
import { API_PATHS } from "../utils/apiPaths";
import TextInput from "../components/Inputs/TextInput";
import SpinnerLoader from "../components/Loaders/SpinnerLoader";
import SkeletonLoader from "../components/Loaders/SkeletonLoader";

const Classes = () => {
  const { user, error } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [date, setDate] = useState(null); // YYYY-MM-DD
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState({});

  useEffect(() => {
    if (date === null || date) fetchClasses();
  }, [date]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(
        `${API_PATHS.CLASSES.GET_ALL_WITH_AVAILABILITY}?date=${date}`
      );
      setClasses(res.data || []);
      setLocalError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        // No classes scheduled for this date
        setClasses([]);
        setLocalError(
          err.response.data.message || "No classes scheduled for this date"
        );
      } else {
        setClasses([]);
        setLocalError(err.response?.data?.message || "Failed to fetch classes");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const bookClass = async (classID) => {
    if (!user) {
      setLocalError("Please log in to book a class");
      return;
    }
    setIsBooking((prev) => ({ ...prev, [classID]: true }));
    try {
      await api.post(API_PATHS.BOOKINGS.CREATE, {
        bookingType: "class",
        classID,
        date,
      });
      setLocalError(null);
      alert("Class booked successfully!");
    } catch (err) {
      setLocalError( "select a date to join a class");
    } finally {
      setIsBooking((prev) => ({ ...prev, [classID]: false }));
    }
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Classes</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}

      <TextInput
        label="Select Date"
        type="date"
        name="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {date === null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {classes.map((c) => (
            <div key={c._id} className="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src={c.imageURLs?.[0] || "/images/default-class.png"}
                  alt={c.name}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{c.className}</h2>
                <p>{c.description}</p>
                <p>Trainer: {c.trainer?.trainerName || "N/A"}</p>
                <div className="flex gap-2">
                  <div>
                    <p>Schedule:</p>
                  </div>
                  <div className="flex flex-col">
                    {c.schedule.map((sch,idx) =>(
                    <div key={idx} className="flex gap-2">
                      <p>{sch.day}</p>
                      <p>{sch.startTime} - {sch.endTime}</p>
                    </div>
                    ))}
                  </div>
                </div>
                <p>Status: {c.cancelled ? "Cancelled" : "Available"}</p>
                {!c.cancelled && (
                  <button
                    className="btn btn-primary"
                    onClick={() => bookClass(c._id)}
                    disabled={isBooking[c._id]}
                  >
                    {isBooking[c._id] ? <SpinnerLoader /> : "Join"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {classes.map((c) => (
            <div key={c._id} className="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src={c.imageURLs?.[0] || "/images/default-class.png"}
                  alt={c.name}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{c.className}</h2>
                <p>{c.description}</p>
                <p>Trainer: {c.trainer?.trainerName || "N/A"}</p>
                <p>
                  Time: {formatTime(c.schedule.startTime)} -{" "}
                  {formatTime(c.schedule.endTime)}
                </p>
                <p>Date: {date}</p>
                <p>Status: {c.cancelled ? "Cancelled" : "Available"}</p>
                {!c.cancelled && (
                  <button
                    className="btn btn-primary"
                    onClick={() => bookClass(c._id)}
                    disabled={isBooking[c._id]}
                  >
                    {isBooking[c._id] ? <SpinnerLoader /> : "Join"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default Classes;
