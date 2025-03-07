import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },
  permissions: { type: Number, default: 0 }, // 0 = user, 1 = exposer, 2 = moderator, 3 = elder moderator
  isBanned: { type: Boolean, default: false },
  records: { type: Array },
  nationality: { type: Object, default: { nation: '', country_code: 'NA' } }
})

export default mongoose.model("User", userSchema)