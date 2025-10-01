import { useEffect, useState, useContext, useRef } from "react";
import { Search, Calendar, Clock, User, Eye, X, ChevronLeft, ChevronRight, Users, Filter, Star, Award, Zap } from "lucide-react";
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
  const [isBooking, setIsBooking] = useState({});
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
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      const res = await api.get(API_PATHS.CLASSES.GET_ONE(classId));
      setSelectedClass(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to fetch class details");
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

  // Calendar utility functions
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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

  const clearFilters = () => {
    setSearchQuery("");
    setDate(null);
  };

  // Reusable components
  const StatusBadge = ({ cancelled, className = "" }) => (
    <div className={`px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-sm border-2 ${
      cancelled 
        ? 'bg-red-500/90 text-white border-red-300' 
        : 'bg-green-500/90 text-white border-green-300'
    } ${className}`}>
      {cancelled ? '⚠ Cancelled' : '✓ Available'}
    </div>
  );

  const InfoCard = ({ icon: Icon, title, value, bgColor = "gray" }) => {
    const colorClasses = {
      gray: { bg: "bg-gray-50 border-gray-200 text-gray-500", icon: "bg-black text-white" },
      blue: { bg: "bg-blue-50 border-blue-200 text-blue-600", icon: "bg-blue-600 text-white" },
      green: { bg: "bg-green-50 border-green-200 text-green-600", icon: "bg-green-600 text-white" },
      purple: { bg: "bg-purple-50 border-purple-200 text-purple-600", icon: "bg-purple-600 text-white" }
    };

    const colors = colorClasses[bgColor];

    return (
      <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border ${colors.bg}`}>
        <div className={`p-1.5 sm:p-2 rounded-full ${colors.icon}`}>
          <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-xs font-bold uppercase tracking-wide ${colors.bg.split(' ')[2]} mb-1`}>
            {title}
          </div>
          <span className="text-black font-bold text-xs sm:text-sm truncate">{value}</span>
        </div>
      </div>
    );
  };

  const BookingButton = ({ classId, cancelled, isModal = false }) => {
    if (cancelled) return null;
    
    return (
      <button
        className="w-full bg-black text-white py-2 sm:py-4 px-4 sm:px-6 hover:bg-gray-800 border-2 border-black hover:border-gray-800 transition-all duration-300 font-black uppercase tracking-widest text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-white transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-2"
        onClick={() => bookClass(classId)}
        disabled={isBooking[classId]}
      >
        {isBooking[classId] ? (
          <BookingLoader text="Booking..." size="sm" />
        ) : (
          <>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{isModal ? 'Book This Class' : 'Join Class'}</span>
            <span className="sm:hidden">{isModal ? 'Book' : 'Join'}</span>
          </>
        )}
      </button>
    );
  };

  // Get class time display
  const getClassTimeDisplay = (classData) => {
    if (!date || !classData.schedule) return null;
    
    if (typeof classData.schedule === 'object' && classData.schedule.startTime && classData.schedule.endTime) {
      return `${formatTime(classData.schedule.startTime)} - ${formatTime(classData.schedule.endTime)}`;
    }
    if (Array.isArray(classData.schedule) && classData.schedule.length > 0 && classData.schedule[0].startTime) {
      return `${formatTime(classData.schedule[0].startTime)} - ${formatTime(classData.schedule[0].endTime)}`;
    }
    return "Time not available";
  };

  const ScheduleDisplay = ({ schedule }) => (
    <div className="space-y-2 max-h-24 overflow-y-auto">
      {Array.isArray(schedule) ? schedule.map((sch, idx) => (
        <div key={idx} className="flex items-center gap-3 text-sm py-1">
          <span className="font-bold text-black min-w-[60px] text-xs uppercase">{sch.day}</span>
          <Clock className="w-3 h-3 text-purple-600" />
          <span className="text-gray-700 font-medium">{sch.startTime} - {sch.endTime}</span>
        </div>
      )) : (
        <div className="text-sm text-gray-500 italic">No schedule available</div>
      )}
    </div>
  );

  const ClassCard = ({ c }) => (
    <div className="group bg-white border-2 border-black shadow-lg hover:shadow-2xl transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={c.imageURLs?.[0] || "/images/default-class.png"}
          alt={c.className}
          className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <button
            onClick={() => fetchClassDetails(c._id)}
            className="bg-white/90 backdrop-blur-sm text-black p-2 sm:p-3 rounded-full hover:bg-white hover:shadow-lg transform hover:scale-110 transition-all duration-300"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <StatusBadge cancelled={c.cancelled} className="absolute top-2 sm:top-4 left-2 sm:left-4" />
        
        {c.featured && (
          <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-2 sm:px-3 py-1 text-xs font-black uppercase tracking-wide border-2 border-yellow-300">
            <Star className="w-3 h-3 inline mr-1" />
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-black mb-2 leading-tight group-hover:text-gray-800 transition-colors">
            {c.className}
          </h2>
          <p className="text-gray-600 line-clamp-2 leading-relaxed text-xs sm:text-sm">
            {c.description}
          </p>
        </div>
        
        <div className="space-y-3">
          <InfoCard 
            icon={User} 
            title="Trainer" 
            value={c.trainer?.trainerName || "N/A"} 
          />
          
          {date ? (
            <>
              <InfoCard 
                icon={Clock} 
                title="Session Time" 
                value={getClassTimeDisplay(c)} 
                bgColor="blue"
              />
              <InfoCard 
                icon={Calendar} 
                title="Selected Date" 
                value={new Date(date).toLocaleDateString()} 
                bgColor="green"
              />
            </>
          ) : (
            <div className="p-3 bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-600 text-white p-2 rounded-full">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wide text-purple-600">Weekly Schedule</div>
              </div>
              <div className="ml-12">
                <ScheduleDisplay schedule={c.schedule} />
              </div>
            </div>
          )}
        </div>
        
        <BookingButton classId={c._id} cancelled={c.cancelled} />
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
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];
    
    // Empty cells for days before month starts
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
          className={`w-10 h-10 text-sm flex items-center justify-center font-bold transition-all duration-200 border-2 
            ${isPast 
              ? 'text-gray-300 cursor-not-allowed border-transparent' 
              : 'hover:bg-black hover:text-white hover:border-black cursor-pointer border-transparent'
            }
            ${isToday 
              ? 'bg-blue-600 text-white border-blue-600' 
              : ''
            }
            ${isSelected && !isToday 
              ? 'bg-black text-white border-black' 
              : ''
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border-2 border-black shadow-2xl z-50 p-3 sm:p-6 w-80 sm:w-96" ref={calendarRef}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 sm:p-3 hover:bg-black hover:text-white border-2 border-black transition-all duration-200 font-bold"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h3 className="font-black text-sm sm:text-xl uppercase tracking-widest text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 sm:p-3 hover:bg-black hover:text-white border-2 border-black transition-all duration-200 font-bold"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-center text-xs font-black text-black py-2 sm:py-3 uppercase tracking-widest bg-gray-100 border border-gray-200">
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4 sm:mb-6">
          {days}
        </div>

        <div className="pt-3 sm:pt-4 border-t-2 border-black space-y-2">
          <button
            onClick={() => {
              setDate(formatDateForInput(new Date()));
              setShowCalendar(false);
            }}
            className="w-full py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-200 font-bold uppercase tracking-wide text-white bg-black hover:bg-gray-800 border-2 border-black"
          >
            Today
          </button>
          <button
            onClick={() => {
              setDate(null);
              setShowCalendar(false);
            }}
            className="w-full py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-200 font-bold uppercase tracking-wide text-black bg-white hover:bg-black hover:text-white border-2 border-black"
          >
            Clear Date
          </button>
        </div>
      </div>
    );
  };

  const ClassModal = () => {
    if (!selectedClass) return null;

    const trainerName = selectedClass.trainer?.trainerName || "N/A";

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white border-2 sm:border-4 border-black max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 sm:border-b-4 border-black gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-wider mb-2">
                  {selectedClass.className}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <StatusBadge cancelled={selectedClass.cancelled} />
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs sm:text-sm font-bold text-gray-600">Premium Class</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-black hover:bg-black hover:text-white p-2 sm:p-4 border-2 border-black transition-all duration-200 font-bold self-start sm:self-auto"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            {selectedClass.imageURLs?.[0] && (
              <div className="mb-6 sm:mb-8 overflow-hidden border-2 sm:border-4 border-black relative group">
                <img
                  src={selectedClass.imageURLs[0]}
                  alt={selectedClass.className}
                  className="w-full h-48 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
            
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 text-black">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-2xl font-black mb-3 sm:mb-4 uppercase tracking-wide border-b-2 border-black pb-2">
                    About This Class
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-lg leading-relaxed">{selectedClass.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-blue-600 mb-1">Lead Trainer</div>
                      <div className="font-black text-xl text-black">{trainerName}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 border-2 border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-600 text-white p-3 rounded-full">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-green-600 mb-1">Class Status</div>
                      <div className={`font-black text-xl ${selectedClass.cancelled ? "text-red-600" : "text-green-600"}`}>
                        {selectedClass.cancelled ? "Cancelled" : "Available"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-purple-600 text-white p-3 rounded-full">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-purple-600 mb-1">Class Schedule</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedClass.schedule?.map((sch, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 border border-purple-200">
                        <span className="font-black text-black uppercase text-sm">{sch.day}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-black">{sch.startTime} - {sch.endTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <BookingButton classId={selectedClass._id} cancelled={selectedClass.cancelled} isModal={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen pt-16">
        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-black text-lg sm:text-xl mb-4 sm:mb-6 rounded-lg shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center mr-2 sm:mr-3 font-bold text-sm sm:text-base">
                  C
                </div>
                CLASSES
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-wider mb-4 sm:mb-6">
                Fitness Classes
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 font-medium max-w-3xl mx-auto mb-6 sm:mb-8">
                Transform your fitness journey with our expert-led classes designed for every level
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg shadow-lg">
                  {filteredClasses.length} Classes Available
                </div>
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide text-sm sm:text-base rounded-lg border border-white/30">
                  Expert Trainers
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {(error || localError) && (
            <div className="bg-red-50 border-2 border-red-500 text-red-800 px-6 py-4 mb-8 font-bold flex items-center gap-3">
              <div className="bg-red-500 text-white p-2 rounded-full">
                <X className="w-5 h-5" />
              </div>
              <span>{error || localError}</span>
            </div>
          )}

          {/* Enhanced Search and Filter Section */}
          <div className="bg-white border-2 sm:border-4 border-black p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-lg rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-black text-white p-2 sm:p-3 rounded-lg">
                  <Filter className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-wide text-black">
                  Find Your Perfect Class
                </h2>
              </div>
              <div className="bg-black text-white px-3 sm:px-4 py-1 sm:py-2 font-bold uppercase tracking-wide text-xs sm:text-sm rounded-lg">
                {filteredClasses.length} Results
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Search Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg z-10 group-hover:bg-gray-800 transition-colors">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search classes, trainers, or activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-black/20 font-medium text-sm sm:text-base rounded-lg transition-all duration-300 hover:shadow-md"
                />
              </div>

              {/* Date Input */}
              <div className="relative group">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors z-10"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <input
                  type="date"
                  name="date"
                  value={date || ""}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-14 sm:pl-16 pr-12 sm:pr-16 py-3 sm:py-4 border-2 border-black bg-white text-black focus:outline-none focus:ring-4 focus:ring-black/20 font-medium text-sm sm:text-base rounded-lg transition-all duration-300 hover:shadow-md"
                />
                {date && (
                  <button
                    onClick={() => setDate(null)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors z-10"
                    title="Clear date"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <CalendarPopup />
              </div>
            </div>
            
            {/* Quick Filter Tags */}
            <div className="mt-4 sm:mt-6">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="text-sm sm:text-base font-semibold text-gray-700">Quick filters:</span>
                <button
                  onClick={() => setSearchQuery("yoga")}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 hover:bg-black hover:text-white text-gray-700 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 border border-gray-300 hover:border-black"
                >
                  Yoga
                </button>
                <button
                  onClick={() => setSearchQuery("cardio")}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 hover:bg-black hover:text-white text-gray-700 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 border border-gray-300 hover:border-black"
                >
                  Cardio
                </button>
                <button
                  onClick={() => setSearchQuery("strength")}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 hover:bg-black hover:text-white text-gray-700 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 border border-gray-300 hover:border-black"
                >
                  Strength
                </button>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 sm:px-4 py-1 sm:py-2 bg-black text-white text-xs sm:text-sm font-medium rounded-full transition-all duration-300"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {filteredClasses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredClasses.map((c) => (
                <ClassCard key={c._id} c={c} />
              ))}
            </div>
          )}

          {filteredClasses.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-100 border-2 border-gray-300 p-12 inline-block mb-6">
                <Search className="w-24 h-24 mx-auto text-gray-400" />
              </div>
              <h3 className="text-4xl font-black text-black mb-4 uppercase tracking-wide">
                No Classes Found
              </h3>
              <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
                {searchQuery 
                  ? `No classes match your search "${searchQuery}". Try different keywords or clear your filters.`
                  : date 
                    ? `No classes scheduled for ${new Date(date).toLocaleDateString()}. Try selecting a different date.`
                    : "No classes are currently available. Please check back later."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={clearFilters}
                  className="px-8 py-3 border-2 border-black font-bold uppercase tracking-wide transition-all duration-200 bg-black text-white hover:bg-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClassModal />
    </MainLayout>
  );
};

export default Classes;