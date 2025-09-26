import { useEffect, useState, useContext, useRef } from "react";
import { Search, Calendar, Clock, User, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/axiosInstance";
import MainLayout from "../components/Layouts/MainLayout";
import AuthContext from "../context/AuthContext";
import { formatTime } from "../utils/helpers";
import { API_PATHS } from "../utils/apiPaths";
import BlackSpinnerLoader from "../components/Loaders/BlackSpinnerLoader";
import BlackSkeletonLoader from "../components/Loaders/BlackSkeletonLoader";

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const calendarRef = useRef(null);

  useEffect(() => {
    if (date === null || date) fetchClasses();
  }, [date]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchQuery]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

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

  const getTrainerName = (classData) => {
    // Try all possible paths for trainer name
    if (classData.trainer) {
      if (typeof classData.trainer === 'string') return classData.trainer;
      if (classData.trainer.trainerName) return classData.trainer.trainerName;
      if (classData.trainer.name) return classData.trainer.name;
      if (classData.trainer.firstName) return `${classData.trainer.firstName} ${classData.trainer.lastName || ''}`.trim();
    }
    if (classData.trainerName) return classData.trainerName;
    if (classData.instructorName) return classData.instructorName;
    if (classData.instructor) {
      if (typeof classData.instructor === 'string') return classData.instructor;
      if (classData.instructor.name) return classData.instructor.name;
    }
    return "N/A";
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

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formattedDate = formatDateForInput(selectedDate);
    setDate(formattedDate);
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const CalendarPopup = () => {
    if (!showCalendar) return null;

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const selectedDate = date ? new Date(date) : null;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = selectedDate && currentDate.toDateString() === selectedDate.toDateString();
      const isPast = currentDate < today && !isToday;

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isPast}
          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors
            ${isPast 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-gray-100 cursor-pointer'
            }
            ${isToday 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : ''
            }
            ${isSelected && !isToday 
              ? 'bg-black text-white hover:bg-gray-800' 
              : ''
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 mt-1 bg-white border-2 border-black rounded-lg shadow-lg z-50 p-4 w-80" ref={calendarRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-lg">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-center text-sm font-medium text-gray-600 py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>

        {/* Clear date button */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              setDate(null);
              setShowCalendar(false);
            }}
            className="w-full py-2 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear Date
          </button>
        </div>
      </div>
    );
  };

  const ClassModal = () => {
    if (!selectedClass) return null;

    // Find the original class data from the classes array to get trainer info as fallback
    const originalClassData = classes.find(c => c._id === selectedClass._id);
    const trainerName = selectedClass.trainer?.trainerName || 
                       originalClassData?.trainer?.trainerName || 
                       "N/A";

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
                <span className="font-medium">Trainer: {trainerName}</span>
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

  if (isLoading) return <BlackSkeletonLoader />;

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
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black cursor-pointer hover:text-gray-600 transition-colors z-10"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <input
                type="date"
                name="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-black rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {date && (
                <button
                  onClick={() => setDate(null)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 hover:text-red-600 transition-colors z-10"
                  title="Clear date"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <CalendarPopup />
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
                        {Array.isArray(c.schedule) ? c.schedule.map((sch, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-black">{sch.day}</span>
                            <Clock className="w-3 h-3" />
                            <span className="text-gray-700">{sch.startTime} - {sch.endTime}</span>
                          </div>
                        )) : (
                          <div className="text-sm text-gray-700">No schedule available</div>
                        )}
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
                        {isBooking[c._id] ? <BlackSpinnerLoader /> : "Join Class"}
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
                        <span className="font-medium">Time:</span> {
                          c.schedule && typeof c.schedule === 'object' && c.schedule.startTime && c.schedule.endTime
                            ? `${formatTime(c.schedule.startTime)} - ${formatTime(c.schedule.endTime)}`
                            : Array.isArray(c.schedule) && c.schedule.length > 0 && c.schedule[0].startTime
                            ? `${formatTime(c.schedule[0].startTime)} - ${formatTime(c.schedule[0].endTime)}`
                            : "Time not available"
                        }
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
                        {isBooking[c._id] ? <BlackSpinnerLoader /> : "Join Class"}
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