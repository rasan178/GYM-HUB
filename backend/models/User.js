const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userID: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  phoneNumber: { type: String },
  role: { type: String, default: 'user' },
  profileImageURL: { type: String },
  createdDate: { type: Date, default: Date.now },
  updatedDate: Date,
  status: { type: String, default: 'active' }
});

userSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate({ name: 'userID' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
    this.userID = `UI${String(counter.seq).padStart(6, '0')}`;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedDate = Date.now();
  next();
});

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);