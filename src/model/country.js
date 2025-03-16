import mongoose from "mongoose";
import { connection, AutoIncrement } from "../db.js"

const countrySchema = new mongoose.Schema({
  _id: { type: Number, require: true },
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false , _id: false});

countrySchema.plugin(AutoIncrement, { id: 'country', inc_field: "_id" })

export default connection.model("Country", countrySchema);