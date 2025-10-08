const Testimonial = require('../models/Testimonial');
const User = require('../models/User');

// Create testimonial (user provides role/job)
exports.createTestimonial = async (req, res) => {
  try {
    const { message, rating, userRole } = req.body;
    
    // Validate required fields
    if (!message || !rating || !userRole) {
      return res.status(400).json({ message: 'Message, rating, and userRole are required' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data = {
      userID: req.user._id,
      userName: user.name,
      userRole,
      message,
      rating,
      status: 'Pending'
    };

    // Handle multiple image uploads (up to 5 images)
    if (req.files && req.files.length > 0) {
      const imageURLs = req.files.map(file => `http://localhost:8000/uploads/testimonials/${file.filename}`);
      
      if (imageURLs.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed per testimonial' });
      }
      
      data.imageURLs = imageURLs;
      
      if (imageURLs.length > 0) {
        data.imageURL = imageURLs[0];
      }
    } else if (req.file) {
      data.imageURL = `http://localhost:8000/uploads/testimonials/${req.file.filename}`;
      data.imageURLs = [data.imageURL];
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

// Get user's own testimonials
exports.getMyTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ userID: req.user._id }).sort({ createdAt: -1 });
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

    // Validate rating if provided
    if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    testimonial.message = req.body.message || testimonial.message;
    testimonial.rating = req.body.rating || testimonial.rating;
    testimonial.userRole = req.body.userRole || testimonial.userRole;

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      const imageURLs = req.files.map(file => `http://localhost:8000/uploads/testimonials/${file.filename}`);
      
      if (imageURLs.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed per testimonial' });
      }
      
      testimonial.imageURLs = imageURLs;
      testimonial.imageURL = imageURLs[0];
    } else if (req.file) {
      testimonial.imageURL = `http://localhost:8000/uploads/testimonials/${req.file.filename}`;
      testimonial.imageURLs = [testimonial.imageURL];
    }

    testimonial.status = 'Pending'; // reset for re-approval
    await testimonial.save();

    res.json({ message: 'Testimonial updated, pending approval', testimonial });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// User: delete own testimonial
exports.deleteOwnTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    // Check if user owns this testimonial
    if (testimonial.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own testimonials' });
    }

    await testimonial.deleteOne();
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Get testimonial statistics
exports.getTestimonialStats = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    
    let totalTestimonials = testimonials.length;
    let pendingTestimonials = 0;
    let approvedTestimonials = 0;
    let rejectedTestimonials = 0;
    let averageRating = 0;

    let totalRating = 0;
    let ratedTestimonials = 0;

    testimonials.forEach(testimonial => {
      switch (testimonial.status) {
        case 'Pending':
          pendingTestimonials++;
          break;
        case 'Approved':
          approvedTestimonials++;
          break;
        case 'Rejected':
          rejectedTestimonials++;
          break;
      }

      if (testimonial.rating) {
        totalRating += testimonial.rating;
        ratedTestimonials++;
      }
    });

    if (ratedTestimonials > 0) {
      averageRating = Math.round((totalRating / ratedTestimonials) * 10) / 10;
    }

    res.json({
      totalTestimonials,
      pendingTestimonials,
      approvedTestimonials,
      rejectedTestimonials,
      averageRating,
      ratedTestimonials
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};