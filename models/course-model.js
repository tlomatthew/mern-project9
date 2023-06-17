const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const courseSchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  description: { type: String, requried: true },
  price: {
    type: Number,
    requried: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId, // mongoose的 primary key
    ref: "User", // 連結到 User model
    required: true,
  },
  students: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Course", courseSchema);
