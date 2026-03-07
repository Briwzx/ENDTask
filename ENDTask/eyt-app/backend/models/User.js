import mongoose from "mongoose";
import bcrypt    from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    nombre:   { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    telefono: { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    anio:     { type: Number, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hashear contraseña automáticamente antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparar contraseña al login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Nunca devolver la contraseña en respuestas JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", UserSchema);
