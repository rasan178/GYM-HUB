import { useEffect, useState, useContext } from "react";
import { Search, Calendar, Clock, User, Eye, X } from "lucide-react";
import api from "../utils/axiosInstance";
import MainLayout from "../components/Layouts/MainLayout";
import AuthContext from "../context/AuthContext";
import { formatTime } from "../utils/helpers";
import { API_PATHS } from "../utils/apiPaths";
import SpinnerLoader from "../components/Loaders/SpinnerLoader";
import SkeletonLoader from "../components/Loaders/SkeletonLoader";

const Classes = () => {
  const { user, error } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [date, setDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState({});
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  useEffect(() => {
    if (date === null || date) fetchClasses();
  }, [date]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery]);

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

  const fetchClassDetails = async (classId) => {
    setIsViewingDetails(true);
    try {
      const res = await api.get(API_PATHS.CLASSES.GET_ONE(classId));
      setSelectedClass(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to fetch class details");
    } finally {
      setIsViewingDetails(false);
    }
  };

  const filterClasses = () => {
    if (!searchQuery.trim()) {
      setFilteredClasses(classes);
      return;
    }

    const filtered = classes.filter((c) =>
      c.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trainer?.trainerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
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
      setLocalError("Select a date to join a class");
    } finally {
      setIsBooking((prev) => ({ ...prev, [classID]: false }));
    }
  };

  const ClassModal = () => {
    if (!selectedClass) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-black">{selectedClass.className}</h2>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-black hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {selectedClass.imageURLs?.[0] && (
              <img
                src={selectedClass.imageURLs[0]}
                alt={selectedClass.className}
                className="w-full h-64 object-cover rounded-lg mb-4 border border-black"
              />
            )}
            
            <div className="space-y-4 text-black">
              <p className="text-gray-700">{selectedClass.description}</p>
              
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">Trainer: {selectedClass.trainer?.trainerName || "N/A"}</span>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Schedule:</span>
                </div>
                <div className="ml-7 space-y-1">
                  {selectedClass.schedule?.map((sch, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-medium">{sch.day}</span>
                      <Clock className="w-4 h-4" />
                      <span>{sch.startTime} - {sch.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className={selectedClass.cancelled ? "text-red-600" : "text-green-600"}>
                  {selectedClass.cancelled ? "Cancelled" : "Available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-black">Classes</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {localError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                placeholder="Search classes, trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="date"
                name="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {date === null ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((c) => (
                <div key={c._id} className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={c.imageURLs?.[0] || "/images/default-class.png"}
                      alt={c.className}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => fetchClassDetails(c._id)}
                      className="absolute top-2 right-2 bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                      disabled={isViewingDetails}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-black mb-2">{c.className}</h2>
                    <p className="text-gray-700 mb-3 line-clamp-2">{c.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-black" />
                      <span className="text-black">
                        <span className="font-medium">Trainer:</span> {c.trainer?.trainerName || "N/A"}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-black" />
                        <span className="font-medium text-black">Schedule:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {c.schedule.map((sch, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-black">{sch.day}</span>
                            <Clock className="w-3 h-3" />
                            <span className="text-gray-700">{sch.startTime} - {sch.endTime}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium text-black">Status: </span>
                      <span className={c.cancelled ? "text-red-600" : "text-green-600"}>
                        {c.cancelled ? "Cancelled" : "Available"}
                      </span>
                    </div>
                    
                    {!c.cancelled && (
                      <button
                        className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => bookClass(c._id)}
                        disabled={isBooking[c._id]}
                      >
                        {isBooking[c._id] ? <SpinnerLoader /> : "Join Class"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((c) => (
                <div key={c._id} className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={c.imageURLs?.[0] || "/images/default-class.png"}
                      alt={c.className}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => fetchClassDetails(c._id)}
                      className="absolute top-2 right-2 bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                      disabled={isViewingDetails}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-black mb-2">{c.className}</h2>
                    <p className="text-gray-700 mb-3 line-clamp-2">{c.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-black" />
                      <span className="text-black">
                        <span className="font-medium">Trainer:</span> {c.trainer?.trainerName || "N/A"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-black" />
                      <span className="text-black">
                        <span className="font-medium">Time:</span> {formatTime(c.schedule.startTime)} - {formatTime(c.schedule.endTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-black">
                        <span className="font-medium">Date:</span> {date}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium text-black">Status: </span>
                      <span className={c.cancelled ? "text-red-600" : "text-green-600"}>
                        {c.cancelled ? "Cancelled" : "Available"}
                      </span>
                    </div>
                    
                    {!c.cancelled && (
                      <button
                        className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => bookClass(c._id)}
                        disabled={isBooking[c._id]}
                      >
                        {isBooking[c._id] ? <SpinnerLoader /> : "Join Class"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredClasses.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-black mb-2">No classes found</h3>
              <p className="text-gray-600">
                {searchQuery ? "Try adjusting your search terms" : "No classes available for the selected criteria"}
              </p>
            </div>
          )}
        </div>
      </div>

      <ClassModal />
    </MainLayout>
  );
};

export default Classes;