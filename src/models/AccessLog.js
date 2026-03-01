const mongoose = require("mongoose");

const AccessLogSchema = new mongoose.Schema(
  {
    urlId: { type: mongoose.Schema.Types.ObjectId, ref: "Url", required: true, index: true },
    ip: { type: String, required: true },
    country: { type: String, required: true, default: "Unknown" },
    accessedAt: { type: Date, required: true, default: Date.now, index: true }
  },
  { timestamps: false }
);

module.exports = mongoose.model("AccessLog", AccessLogSchema);
