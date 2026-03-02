const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    shortUrl: { type: String, required: true },
    baseUrl: { type: String, required: true },
    totalAccesses: { type: BigInt, required: false},
    countries: [{name: {type: String, required: false}}],
    dailyFrequency: {type: BigInt, required: false}
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Url", UrlSchema);
