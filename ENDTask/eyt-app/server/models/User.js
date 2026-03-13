import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  password: String,
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", UserSchema);