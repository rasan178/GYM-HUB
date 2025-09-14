const Testimonial = require('../models/Testimonial');
const User = require('../models/User');

// Create testimonial (user provides role/job)
exports.createTestimonial = async (req, res) => {
  try {
    const { message, rating, userRole } = req.body; // user provides role/job
    const user = await User.findById(req.user._id);

    const data = {
      userID: req.user._id,
      userName: user.name,      // auto from User
      userRole,                 // from request
      message,
      rating,
      status: 'Pending'
    };

    if (req.file) {
      data.imageURL = `http://localhost:8000/uploads/testimonials/${req.file.filename}`;
    }

    const testimonial = await Testimonial.create(data);
    res.status(201).json({ message: 'Testimonial submitted, pending approval', testimonial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get approved testimonials (public)
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'Approved' }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: approve testimonial
exports.approveTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    testimonial.status = 'Approved';
    await testimonial.save();
    res.json({ message: 'Testimonial approved', testimonial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: reject testimonial
exports.rejectTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    testimonial.status = 'Rejected';
    await testimonial.save();
    res.json({ message: 'Testimonial rejected', testimonial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// User: update testimonial (within 10 days)
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    if (testimonial.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own testimonial' });
    }

    const now = new Date();
    const diffDays = Math.floor((now - new Date(testimonial.createdAt)) / (1000 * 60 * 60 * 24));
    if (diffDays > 10) {
      return res.status(400).json({ message: 'You can no longer edit your testimonial after 10 days' });
    }

    testimonial.message = req.body.message || testimonial.message;
    testimonial.rating = req.body.rating || testimonial.rating;
    testimonial.userRole = req.body.userRole || testimonial.userRole; // allow update of role

    if (req.file) {
      testimonial.imageURL = `http://localhost:8000/uploads/testimonials/${req.file.filename}`;
    }

    testimonial.status = 'Pending'; // reset for re-approval
    await testimonial.save();

    res.json({ message: 'Testimonial updated, pending approval', testimonial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    await testimonial.deleteOne();
    res.json({ message: 'Testimonial removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
