import mongoose from "mongoose";
import { connection, AutoIncrement } from "../db.js"

const recordSchema = new mongoose.Schema({
  _id: { type: Number, require: true },
  percent: { type: Number, require: true, },
  video: { type: String, require: true },
  record_status: { type: Number, require: true, default: 1 }, // 2 = approved, 3 = rejected, 1 = submitted
  demon_name: { type: String, require: true },
  demon_id: { type: Number, require: true },
  demon_holder: { type: String, require: true },
  user_submitter_id: { type: Number, require: true },
  user_submitter_name: { type: String, require: true },
  raw_footage: { type: String, require: true },
  description: { type: String, require: false },
  reason: { type: String, require: false },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false , _id: false })

recordSchema.plugin(AutoIncrement, { id: 'record', inc_field: "_id" })

export default connection.model("Record", recordSchema)