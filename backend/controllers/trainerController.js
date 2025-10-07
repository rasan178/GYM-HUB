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
const getTrainerStatus = (trainer) => {
  // If admin has manually deactivated the trainer, it cannot be auto-activated
  // This overrides the schedule-based activation/deactivation
  if (trainer.adminDeactivated) {
    return "Inactive";
  }

  const schedule = trainer.schedule;
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

    // Parse form-data string fields
    if (typeof specialty === "string") {
      try {
        specialty = JSON.parse(specialty); // try JSON first
      } catch {
        specialty = specialty.split(",").map(s => s.trim());
      }
    }
    if (typeof schedule === "string") schedule = JSON.parse(schedule);
    if (typeof contactInfo === "string") contactInfo = JSON.parse(contactInfo);
    if (typeof socialLinks === "string") socialLinks = JSON.parse(socialLinks);

    if (!Array.isArray(schedule)) return res.status(400).json({ message: "Schedule must be an array" });

    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) return res.status(400).json({ message: "Trainer with this email already exists" });

    const trainerID = await generateTrainerID();
    const trainerData = { trainerID, trainerName, email, specialty, experience, qualifications, bio, schedule, contactInfo, socialLinks };
    
    // Handle multiple image uploads (up to 5 images)
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => `http://localhost:8000/uploads/trainers/${file.filename}`);
      
      // Limit to maximum 5 images
      if (images.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed per trainer' });
      }
      
      trainerData.images = images;
      
      // For backward compatibility, set the first image as image
      if (images.length > 0) {
        trainerData.image = images[0];
      }
    } else if (req.file) {
      // Handle single image upload (backward compatibility)
      trainerData.image = `http://localhost:8000/uploads/trainers/${req.file.filename}`;
      trainerData.images = [trainerData.image];
    }

    const trainer = await Trainer.create(trainerData);

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        ...trainer.toObject(),
        status: getTrainerStatus(trainer),
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

    // Parse form-data string fields
    if (typeof specialty === "string") {
      try {
        specialty = JSON.parse(specialty);
      } catch {
        specialty = specialty.split(",").map(s => s.trim());
      }
    }
    if (typeof schedule === "string") schedule = JSON.parse(schedule);
    if (typeof contactInfo === "string") contactInfo = JSON.parse(contactInfo);
    if (typeof socialLinks === "string") socialLinks = JSON.parse(socialLinks);

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
    
    // Handle multiple image uploads (up to 5 images)
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => `http://localhost:8000/uploads/trainers/${file.filename}`);
      
      // Limit to maximum 5 images
      if (images.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed per trainer' });
      }
      
      trainer.images = images;
      
      // For backward compatibility, set the first image as image
      if (images.length > 0) {
        trainer.image = images[0];
      }
    } else if (req.file) {
      // Handle single image upload (backward compatibility)
      trainer.image = `http://localhost:8000/uploads/trainers/${req.file.filename}`;
      trainer.images = [trainer.image];
    }

    await trainer.save();

    res.json({
      message: "Trainer updated successfully",
      trainer: {
        ...trainer.toObject(),
        status: getTrainerStatus(trainer),
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
    let trainers;
    
    // If user is not admin, filter out admin-deactivated trainers
    if (req.user && !req.user.isAdmin) {
      trainers = await Trainer.find({ adminDeactivated: { $ne: true } });
    } else {
      trainers = await Trainer.find();
    }
    
    const data = trainers.map(t => ({
      ...t.toObject(),
      status: getTrainerStatus(t),
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

    // If user is not admin and trainer is admin-deactivated, return not found
    if (req.user && !req.user.isAdmin && trainer.adminDeactivated) {
      return res.status(404).json({ message: "This trainer is currently unavailable. They may be on leave or temporarily suspended. Please contact support for assistance." });
    }

    res.json({
      ...trainer.toObject(),
      status: getTrainerStatus(trainer),
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

// ========================= DEACTIVATE TRAINER (Admin Only) =========================
exports.deactivateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    if (trainer.adminDeactivated) {
      return res.status(400).json({ message: "Trainer is already deactivated by admin" });
    }

    trainer.adminDeactivated = true;
    trainer.adminDeactivatedAt = new Date();
    await trainer.save();

    res.json({ 
      message: "Trainer deactivated successfully", 
      trainer: {
        ...trainer.toObject(),
        status: getTrainerStatus(trainer),
        schedule: cleanSchedule(trainer.schedule)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= REACTIVATE TRAINER (Admin Only) =========================
exports.reactivateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });

    if (!trainer.adminDeactivated) {
      return res.status(400).json({ message: "Trainer is not deactivated by admin" });
    }

    trainer.adminDeactivated = false;
    trainer.adminDeactivatedAt = null;
    await trainer.save();

    res.json({ 
      message: "Trainer reactivated successfully", 
      trainer: {
        ...trainer.toObject(),
        status: getTrainerStatus(trainer),
        schedule: cleanSchedule(trainer.schedule)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET TRAINER STATISTICS =========================
exports.getTrainerStats = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    
    let totalTrainers = trainers.length;
    let activeTrainers = 0;
    let inactiveTrainers = 0;
    let adminDeactivatedTrainers = 0;

    trainers.forEach(trainer => {
      const status = getTrainerStatus(trainer);
      if (trainer.adminDeactivated) {
        adminDeactivatedTrainers++;
        inactiveTrainers++;
      } else if (status === "Active") {
        activeTrainers++;
      } else {
        inactiveTrainers++;
      }
    });

    res.json({
      totalTrainers,
      activeTrainers,
      inactiveTrainers,
      adminDeactivatedTrainers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
