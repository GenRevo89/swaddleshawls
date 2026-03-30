import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
    },
    category: {
      type: String,
      required: [true, "Please choose an interest category"],
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
    },
  },
  { timestamps: true }
);

// Prevent mongoose from recompiling the model if it already exists
export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
