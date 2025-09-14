const Trainer = require('../models/Trainer');
const Class = require('../models/Class');
const Booking = require('../models/Booking');
const Membership = require('../models/Membership');
const Counter = require('../models/Counter'); // for auto-increment IDs

// ========================= Helper: Generate unique Trainer ID =========================
async function generateTrainerID() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'trainerID' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `TI${String(counter.seq).padStart(4, '0')}`;
}

// ========================= Helper: Determine Trainer Status =========================
const getTrainerStatus = (schedule) => {
  if (!schedule || schedule.length === 0) return "Inactive";

  const now = new Date();
  const day = now.toLocaleString("en-US", { weekday: "short" });
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const slot of schedule) {
    if (slot.day && slot.startTime && slot.endTime) {
      const days = slot.day.split(",").map(d => d.trim());
      if (days.includes(day)) {
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        if (currentTime >= startMinutes && currentTime <= endMinutes) {
          return "Active";
        }
      }
    }

    if (slot.date) {
      const slotDate = new Date(slot.date).toDateString();
      if (slotDate === now.toDateString()) return "Active";
    }
  }

  return "Inactive";
};

// ========================= Helper: Clean schedule & add duration =========================
const cleanSchedule = (schedule) => {
  if (!Array.isArray(schedule)) return [];
  return schedule.map(({ day, startTime, endTime, date }) => {
    let duration = null;
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      duration = endMinutes > startMinutes ? endMinutes - startMinutes : 0;
    }
    return { day, startTime, endTime, date, duration };
  });
};

// ========================= CREATE TRAINER =========================
exports.createTrainer = async (req, res) => {
  try {
    let { trainerName, email, specialty, experience, qualifications, bio, schedule, contactInfo, socialLinks } = req.body;

    if (typeof specialty === "string") specialty = specialty.split(",").map(s => s.trim());
    if (typeof schedule === "string") schedule = JSON.parse(schedule);
    if (!Array.isArray(schedule)) return res.status(400).json({ message: "Schedule must be an array" });

    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) return res.status(400).json({ message: "Trainer with this email already exists" });

    const trainerID = await generateTrainerID();
    const trainerData = { trainerID, trainerName, email, specialty, experience, qualifications, bio, schedule, contactInfo, socialLinks };
    if (req.file) trainerData.image = `http://localhost:8000/uploads/trainers/${req.file.filename}`;

    const trainer = await Trainer.create(trainerData);

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        ...trainer.toObject(),
        status: getTrainerStatus(trainer.schedule),
        schedule: cleanSchedule(trainer.schedule)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// ========================= UPDATE TRAINER =========================
exports.updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    let { trainerName, email, specialty, experience, qualifications, bio, schedule, contactInfo, socialLinks } = req.body;

    if (typeof specialty === "string") specialty = specialty.split(",").map(s => s.trim());
    if (typeof schedule === "string") schedule = JSON.parse(schedule);
    if (schedule && !Array.isArray(schedule)) return res.status(400).json({ message: "Schedule must be an array" });

    if (email && email !== trainer.email) {
      const duplicate = await Trainer.findOne({ email });
      if (duplicate) return res.status(400).json({ message: "Trainer with this email already exists" });
    }

    trainer.trainerName = trainerName || trainer.trainerName;
    trainer.email = email || trainer.email;
    trainer.specialty = specialty || trainer.specialty;
    trainer.experience = experience || trainer.experience;
    trainer.qualifications = qualifications || trainer.qualifications;
    trainer.bio = bio || trainer.bio;
    trainer.schedule = schedule || trainer.schedule;
    trainer.contactInfo = contactInfo || trainer.contactInfo;
    trainer.socialLinks = socialLinks || trainer.socialLinks;
    if (req.file) trainer.image = `http://localhost:8000/uploads/trainers/${req.file.filename}`;

    await trainer.save();

    res.json({
      message: "Trainer updated successfully",
      trainer: {
        ...trainer.toObject(),
        status: getTrainerStatus(trainer.schedule),
        schedule: cleanSchedule(trainer.schedule)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// ========================= GET ALL TRAINERS =========================
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    const data = trainers.map(t => ({
      ...t.toObject(),
      status: getTrainerStatus(t.schedule),
      specialty: Array.isArray(t.specialty) ? t.specialty.join(", ") : t.specialty,
      schedule: cleanSchedule(t.schedule)
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET TRAINER BY ID =========================
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    res.json({
      ...trainer.toObject(),
      status: getTrainerStatus(trainer.schedule),
      specialty: Array.isArray(trainer.specialty) ? trainer.specialty.join(", ") : trainer.specialty,
      schedule: cleanSchedule(trainer.schedule)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= DELETE TRAINER =========================
exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    await Class.deleteMany({ trainerID: trainer._id });
    await Booking.deleteMany({ trainerID: trainer._id });
    await Membership.updateMany({ trainerAssigned: trainer._id }, { trainerAssigned: null });

    await trainer.deleteOne();
    res.json({ message: "Trainer removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
