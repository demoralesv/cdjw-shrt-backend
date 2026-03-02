const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    shortUrl: { type: String, required: true },
    baseUrl: { type: String, required: true },
    totalAccesses: { type: Number, default: 0},
    countries: [{name: String, counter: {type: Number, default: 1}}],
    dailyFrequency: {type: Number, default: 0}
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Url", UrlSchema);
