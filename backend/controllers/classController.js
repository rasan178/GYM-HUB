const Class = require('../models/Class');
const Trainer = require('../models/Trainer');

// ========================= HELPERS =========================

// Calculate duration in minutes from startTime and endTime
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return endMinutes > startMinutes ? endMinutes - startMinutes : 0;
};

// Validate schedule format
const validateSchedule = (schedule) => {
  if (!Array.isArray(schedule) || schedule.length === 0) return false;
  return schedule.every(entry => entry.day || entry.date);
};

// Validate trainer availability
const validateTrainerAvailability = (trainer, classSchedule) => {
  if (!trainer.schedule || !Array.isArray(trainer.schedule) || trainer.schedule.length === 0) {
    return null; // no schedule = always available
  }

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  for (let entry of classSchedule) {
    if (!entry.day || !entry.startTime || !entry.endTime) continue;

    const classStart = timeToMinutes(entry.startTime);
    const classEnd = timeToMinutes(entry.endTime);

    // Find matching trainer schedule for that day
    const matchingDay = trainer.schedule.find(ts => ts.day.substring(0, 3) === entry.day.substring(0, 3));
    if (!matchingDay) {
      return `Trainer is not available on ${entry.day}`;
    }

    const trainerStart = timeToMinutes(matchingDay.startTime);
    const trainerEnd = timeToMinutes(matchingDay.endTime);

    if (classStart < trainerStart || classEnd > trainerEnd) {
      return `Trainer is not available at ${entry.startTime}-${entry.endTime} on ${entry.day}`;
    }
  }

  return null;
};

// ========================= CREATE CLASS =========================
const createClass = async (req, res) => {
  try {
    const {
      className,
      description,
      trainerID,
      schedule,
      capacity,
      location,
      price,
      status,
      category,
      level
    } = req.body;

    const parsedSchedule = typeof schedule === "string" ? JSON.parse(schedule) : schedule;

    if (!validateSchedule(parsedSchedule)) {
      return res.status(400).json({ message: 'Invalid schedule format' });
    }

    const trainer = await Trainer.findById(trainerID);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    if (category && !trainer.specialty.includes(category)) {
      return res.status(400).json({
        message: `Trainer ${trainer.trainerName} does not specialize in ${category}`
      });
    }

    const availabilityError = validateTrainerAvailability(trainer, parsedSchedule);
    if (availabilityError) return res.status(400).json({ message: availabilityError });

    // Auto-calculate duration per schedule entry (no _id)
    const scheduleWithDuration = parsedSchedule.map(entry => ({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: calculateDuration(entry.startTime, entry.endTime)
    }));

    let imageURLs = [];
    if (req.files && req.files.length > 0) {
      imageURLs = req.files.map(file => `http://localhost:8000/uploads/classes/${file.filename}`);
    }

    const newClass = new Class({
      className,
      description,
      trainerID,
      schedule: scheduleWithDuration,
      capacity: Number(capacity),
      location,
      price: Number(price),
      status: status || 'Active',
      imageURLs,
      category,
      level
    });

    await newClass.save();
    res.status(201).json({ message: 'Class created successfully', class: newClass });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= GET ALL CLASSES WITH AVAILABILITY =========================
const getAllClassesWithAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    // Fetch classes with trainer data first
    const classes = await Class.find().populate("trainerID");

    // Case 1: If no date provided or date=null, return all classes
    if (!date || date === "null") {
      const result = classes.map(cls => ({
        _id: cls._id,
        className: cls.className,
        description: cls.description,
        trainer: cls.trainerID,
        schedule: cls.schedule,
        capacity: cls.capacity,
        location: cls.location,
        price: cls.price,
        status: cls.status,
        category: cls.category,
        level: cls.level,
        imageURLs: cls.imageURLs,
        cancellations: cls.cancellations,
      }));
      return res.json(result);
    }

    // Case 2: Date provided → filter by day of week
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const targetDateStr = parsedDate.toISOString().split("T")[0]; // "yyyy-mm-dd"
    const dayOfWeek = parsedDate.toLocaleString("en-US", { weekday: "short" });

    const result = classes
      .map(cls => {
        const scheduleEntry = cls.schedule.find(s => s.day.includes(dayOfWeek));
        if (!scheduleEntry) return null;

        const isCancelled = cls.cancellations.some(c => c.date === targetDateStr);

        return {
          _id: cls._id,
          className: cls.className,
          description: cls.description,
          trainer: cls.trainerID,
          schedule: scheduleEntry,
          date: targetDateStr,
          cancelled: isCancelled,
          startTime: scheduleEntry.startTime,
          endTime: scheduleEntry.endTime,
          imageURLs: cls.imageURLs,
        };
      })
      .filter(Boolean); // remove nulls

    if (result.length === 0) {
      return res.status(404).json({ message: "No classes scheduled for this date" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ========================= GET ALL CLASSES =========================
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('trainerID');

    if (classes.length === 0) {
      return res.status(404).json({ message: 'No classes found' });
    }

    // Map to a cleaner response if needed
    const result = classes.map(cls => ({
      _id: cls._id,
      className: cls.className,
      description: cls.description,
      trainer: cls.trainerID, // full trainer info
      schedule: cls.schedule,
      capacity: cls.capacity,
      location: cls.location,
      price: cls.price,
      status: cls.status,
      category: cls.category,
      level: cls.level,
      imageURLs: cls.imageURLs,
      cancellations: cls.cancellations
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ========================= GET CLASS BY ID =========================
const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('trainerID');
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    res.json({
      ...cls.toObject(),
      cancellations: cls.cancellations.map(c => ({
        date: c.date,           // "yyyy-mm-dd" string
        startTime: c.startTime,
        endTime: c.endTime
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= UPDATE CLASS =========================
const updateClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const {
      className,
      description,
      trainerID,
      schedule,
      capacity,
      location,
      price,
      status,
      category,
      level
    } = req.body;

    let parsedSchedule;
    if (schedule) {
      parsedSchedule = typeof schedule === "string" ? JSON.parse(schedule) : schedule;
      if (!validateSchedule(parsedSchedule)) {
        return res.status(400).json({ message: 'Invalid schedule format' });
      }
    }

    if (trainerID) {
      const trainer = await Trainer.findById(trainerID);
      if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

      if (category && !trainer.specialty.includes(category)) {
        return res.status(400).json({ message: `Trainer ${trainer.trainerName} does not specialize in ${category}` });
      }

      if (parsedSchedule) {
        const availabilityError = validateTrainerAvailability(trainer, parsedSchedule);
        if (availabilityError) return res.status(400).json({ message: availabilityError });
      }

      cls.trainerID = trainer._id;
    }

    if (parsedSchedule) {
      // Add durations per entry (no _id)
      cls.schedule = parsedSchedule.map(entry => ({
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: calculateDuration(entry.startTime, entry.endTime)
      }));
    }

    cls.className = className || cls.className;
    cls.description = description || cls.description;
    cls.capacity = capacity ? Number(capacity) : cls.capacity;
    cls.location = location || cls.location;
    cls.price = price ? Number(price) : cls.price;
    cls.status = status || cls.status;
    cls.category = category || cls.category;
    cls.level = level || cls.level;

    if (req.files && req.files.length > 0) {
      cls.imageURLs = req.files.map(file => `http://localhost:8000/uploads/classes/${file.filename}`);
    }

    await cls.save();
    res.json({ message: 'Class updated successfully', class: cls });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= DELETE CLASS =========================
const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    await cls.deleteOne();
    res.json({ message: 'Class removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel Class Date
const cancelClassDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const cancelDate = new Date(date);
    const cancelDateStr = cancelDate.toISOString().split('T')[0]; // "yyyy-mm-dd"

    // Check if already cancelled
    const exists = cls.cancellations.some(d => d.date === cancelDateStr);
    if (exists) return res.status(400).json({ message: 'Class already cancelled for this date' });

    // Find schedule for the day
    const dayOfWeek = cancelDate.toLocaleString('en-US', { weekday: 'short' });
    const scheduleEntry = cls.schedule.find(s => s.day.includes(dayOfWeek));

    if (!scheduleEntry) {
      return res.status(400).json({ message: 'No scheduled class for this date' });
    }

    cls.cancellations.push({
      date: cancelDateStr,
      startTime: scheduleEntry.startTime,
      endTime: scheduleEntry.endTime
    });

    await cls.save();

    res.json({
      message: 'Class cancelled for this date',
      class: cls
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Activate Class Date
const activateClassDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const targetDateStr = new Date(date).toISOString().split('T')[0]; // "yyyy-mm-dd"

    const wasCancelled = cls.cancellations.some(d => d.date === targetDateStr);
    if (!wasCancelled) {
      return res.status(400).json({ message: 'No cancellation found for this date' });
    }

    cls.cancellations = cls.cancellations.filter(d => d.date !== targetDateStr);

    await cls.save();

    res.json({
      message: 'Class reactivated for this date',
      class: cls
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getAllClassesWithAvailability,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  cancelClassDate,
  activateClassDate,
};

