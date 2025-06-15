import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  matricule: { type: String },
  NIR: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String },
  email: { type: String },
  age: { type: Number },
  birthDate: { type: Date },
  gender: { type: String },
  address: { type: String },
  phone: { type: String },
  hobbies: { type: [String], required: false, default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
