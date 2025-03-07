import mongoose from "mongoose";

const nationalitySchema = new mongoose.Schema({
  nation: { type: String, require: true },
  country_code: { type: String, require: true, unique: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model("Nationality", nationalitySchema)