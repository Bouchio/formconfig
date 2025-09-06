import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  matricule: String,
  NIR: String,
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  age: Number,
  birthDate: String,
  gender: String,
  address: String,
  phone: String,
  hobbies: [String],
  isActive: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: "admin" // Mot de passe par défaut pour tous les utilisateurs
  },
  role: {
    type: String,
    enum: ['Admin', 'RH', 'Directeur', 'Utilisateur'],
    default: 'Utilisateur'
  }
});

const User = mongoose.model("User", userSchema);

export default User;
