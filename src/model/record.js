import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  progress: { type: Number, require: true, },
  video: { type: String, require: true },
  record_status: { type: String, require: true, default: "submitted" }, // approved, rejected, submitted
  demon: { type: Object, require: true },
  user_holder: { type: Object, require: true },
  raw_footage: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Record", recordSchema)