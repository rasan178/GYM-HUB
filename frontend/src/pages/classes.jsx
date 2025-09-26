import { useEffect, useState, useContext, useRef } from "react";
import { Search, Calendar, Clock, User, Eye, X, ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import api from "../utils/axiosInstance";
import MainLayout from "../components/Layouts/MainLayout";
import AuthContext from "../context/AuthContext";
import { formatTime } from "../utils/helpers";
import { API_PATHS } from "../utils/apiPaths";
import BookingLoader from "../components/Loaders/BookingLoader";

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
    fetchClasses();
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

  // Get class time display based on date selection and schedule structure
  const getClassTimeDisplay = (classData) => {
    if (date && classData.schedule) {
      // For date-specific view, show time from schedule object or first schedule item
      if (typeof classData.schedule === 'object' && classData.schedule.startTime && classData.schedule.endTime) {
        return `${formatTime(classData.schedule.startTime)} - ${formatTime(classData.schedule.endTime)}`;
      }
      if (Array.isArray(classData.schedule) && classData.schedule.length > 0 && classData.schedule[0].startTime) {
        return `${formatTime(classData.schedule[0].startTime)} - ${formatTime(classData.schedule[0].endTime)}`;
      }
      return "Time not available";
    }
    return null; // For general view, don't show time
  };

  // Unified ClassCard component
  const ClassCard = ({ c }) => (
    <div className="bg-white border border-black rounded-none overflow-hidden shadow-none hover:shadow-lg transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={c.imageURLs?.[0] || "/images/default-class.png"}
          alt={c.className}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <button
          onClick={() => fetchClassDetails(c._id)}
          className="absolute top-4 right-4 bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-lg transform hover:scale-110"
          disabled={isViewingDetails}
        >
          <Eye className="w-5 h-5" />
        </button>
        
        {/* Status badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
          c.cancelled 
            ? 'bg-black text-white' 
            : 'bg-white text-black'
        }`}>
          {c.cancelled ? 'Cancelled' : 'Available'}
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold text-black mb-3 leading-tight">{c.className}</h2>
        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{c.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-full">
              <User className="w-4 h-4" />
            </div>
            <span className="text-black font-medium">
              {c.trainer?.trainerName || "N/A"}
            </span>
          </div>
          
          {/* Conditional rendering based on date selection */}
          {date ? (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 rounded-full">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-black font-medium">{getClassTimeDisplay(c)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 rounded-full">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-black font-medium">{date}</span>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-black text-white p-2 rounded-full">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-bold text-black uppercase tracking-wide text-sm">Schedule</span>
              </div>
              <div className="ml-12 space-y-2">
                {Array.isArray(c.schedule) ? c.schedule.map((sch, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-black min-w-[60px]">{sch.day}</span>
                    <Clock className="w-3 h-3 text-gray-600" />
                    <span className="text-gray-600">{sch.startTime} - {sch.endTime}</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500 italic">No schedule available</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {!c.cancelled && (
          <button
            className="w-full bg-black text-white py-4 px-6 rounded-none hover:bg-white hover:text-black border-2 border-black transition-all duration-300 font-bold uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white"
            onClick={() => bookClass(c._id)}
            disabled={isBooking[c._id]}
          >
            {isBooking[c._id] ? <BookingLoader text="Booking..." /> : "Join Class"}
          </button>
        )}
      </div>
    </div>
  );

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

    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
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
          className={`w-10 h-10 text-sm rounded-none flex items-center justify-center transition-all duration-200 font-medium
            ${isPast 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-black hover:text-white cursor-pointer'
            }
            ${isToday 
              ? 'bg-black text-white' 
              : ''
            }
            ${isSelected && !isToday 
              ? 'bg-black text-white' 
              : ''
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border-2 border-black rounded-none shadow-2xl z-50 p-6 w-80" ref={calendarRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-black hover:text-white rounded-none transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-lg uppercase tracking-wide">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-black hover:text-white rounded-none transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-center text-sm font-bold text-black py-2 uppercase tracking-wide">
              {dayName}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {days}
        </div>

        {/* Clear date button */}
        <div className="pt-4 border-t-2 border-black">
          <button
            onClick={() => {
              setDate(null);
              setShowCalendar(false);
            }}
            className="w-full py-3 px-4 text-sm text-black hover:bg-black hover:text-white border-2 border-black rounded-none transition-all duration-200 font-bold uppercase tracking-wide"
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
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-2 border-black rounded-none max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-black uppercase tracking-wide">{selectedClass.className}</h2>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-black hover:bg-black hover:text-white p-3 rounded-none transition-all duration-200 border-2 border-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {selectedClass.imageURLs?.[0] && (
              <div className="mb-6 overflow-hidden border-2 border-black">
                <img
                  src={selectedClass.imageURLs[0]}
                  alt={selectedClass.className}
                  className="w-full h-80 object-cover"
                />
              </div>
            )}
            
            <div className="space-y-6 text-black">
              <p className="text-gray-700 text-lg leading-relaxed">{selectedClass.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-black text-white p-3 rounded-full">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Trainer</div>
                      <div className="font-bold text-lg">{trainerName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-black text-white p-3 rounded-full">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Status</div>
                      <div className={`font-bold text-lg ${selectedClass.cancelled ? "text-red-600" : "text-green-600"}`}>
                        {selectedClass.cancelled ? "Cancelled" : "Available"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-black text-white p-3 rounded-full">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Schedule</div>
                    </div>
                  </div>
                  <div className="ml-16 space-y-3">
                    {selectedClass.schedule?.map((sch, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 border border-black">
                        <span className="font-bold text-black min-w-[80px] uppercase text-sm">{sch.day}</span>
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{sch.startTime} - {sch.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        <div className="p-8">
          <div className="border-b-4 border-black pb-6 mb-8">
            <h1 className="text-5xl font-bold text-black uppercase tracking-wider">Classes</h1>
          </div>
          
          {error && (
            <div className="bg-white border-2 border-black text-black px-6 py-4 mb-6 font-bold">
              {error}
            </div>
          )}
          {localError && (
            <div className="bg-white border-2 border-black text-black px-6 py-4 mb-6 font-bold">
              {localError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full z-10">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search classes, trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-4 border-2 border-black rounded-none bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-20 font-medium text-lg"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors z-10"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <input
                type="date"
                name="date"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-16 pr-16 py-4 border-2 border-black rounded-none bg-white text-black focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-20 font-medium text-lg"
              />
              {date && (
                <button
                  onClick={() => setDate(null)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                  title="Clear date"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <CalendarPopup />
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="bg-black text-white px-8 py-4 font-bold uppercase tracking-wide">
                Loading Classes...
              </div>
            </div>
          )}

          {/* Single unified class grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.map((c) => (
                <ClassCard key={c._id} c={c} />
              ))}
            </div>
          )}

          {filteredClasses.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="bg-black text-white p-6 inline-block mb-6">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-black mb-4 uppercase tracking-wide">No Classes Found</h3>
              <p className="text-gray-600 text-lg">
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