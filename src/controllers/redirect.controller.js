const Url = require("../models/Url");
const AccessLog = require("../models/AccessLog");
const { getCountryFromIP } = require("../services/geoip.service");

function getClientIP(req) {
  return req.ip; // con trust proxy toma X-Forwarded-For
}

async function redirect(req, res) {
  const { code } = req.params;
  const url = await Url.findOne({ code });
  if (!url) return res.status(404).send("Not found");

  const ip = getClientIP(req);
  const country = await getCountryFromIP(ip);

  await AccessLog.create({
    urlId: url._id,
    ip,
    country,
    accessedAt: new Date()
  });
  url.totalAccesses += 1;
  await Url.updateOne(
    { code: url.code },
    { $addToSet: {countries: country}}
  );
  
  return res.redirect(302, url.originalUrl);
}

module.exports = { redirect };
