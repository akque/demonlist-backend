import mongoose from "mongoose";
import { connection, AutoIncrement } from "../db.js"

const demonSchema = new mongoose.Schema({
  _id: { type: Number, require: true },
  name: { type: String, require: true },
  holder: { type: String, require: true },
  place: { type: Number, require: true },
  description: { type: String, require: true },
  verifier: { type: String, require: true },
  creator: { type: String, require: true },
  video: { type: String, require: true },
  level_id: { type: Number, require: true },
  minimal_percent: { type: Number, require: true },
  records: { type: Array, default: [] },
  score: { type: Number, default: 0 },
  length: { type: Number, require: true }, // in secs
  version: { type: String, require: true },
  objects: { type: Number, require: true },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false, _id: false })

demonSchema.plugin(AutoIncrement, { id: 'demon', inc_field: "_id" })

demonSchema.methods.calculateScore = function() {
  let score = 0
  const place = this.place

  if (place <= 1) {
    score = 1000
  } else if (place <= 8) {
    score = 1000 - (place - 1) * 40
  } else if (place <= 10) {
    score = 1000 - (place - 1) * 60
  } else if (place <= 20) {
    score = 600 - (place - 10) * 20
  } else if (place <= 50) {
    score = 400 - (place - 20) * 4
  } else if (place <= 75) {
    score = 280 - (place - 50) * 8
  } else if (place <= 150) {  
    score = 80 - (place - 75)
  } else if (place <= 250) {
    score = 5 - Math.floor((place - 150) / 10) * 0.4
  } else {
    score = 0.01
  }

  return Math.max(score, 0.01)
}

export default connection.model("Demon", demonSchema)