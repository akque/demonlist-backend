import mongoose from "mongoose";

const demonSchema = new mongoose.Schema({
  name: { type: String, require: true, },
  position: { type: Number, require: true },
  video: { type: String, require: true },
  level_id: { type: Number, require: true },
  thumbnail: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
  verifier: { type: String, require: true },
  publisher: { type: String, require: true },
})

export default mongoose.model("Demon", demonSchema)