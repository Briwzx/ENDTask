import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://eyt_admin:polloloko32@eyt-cluster.lgdftmx.mongodb.net/eytapp?retryWrites=true&w=majority",
    );

    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Error conectando MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
