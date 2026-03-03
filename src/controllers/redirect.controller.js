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

  const exists = await Url.updateOne(
    { code: url.code,
     "countries.name": country
    },
    {
      $inc: {"countries.$.counter": 1}
    }
  );
  if (exists.matchedCount === 0){
    await Url.updateOne(
      {code: url.code},
      {
        $push: { countries: {name: country, counter: 1}}
      }
    )
  }
  const exists2 = await Url.updateOne(
    { code: url.code,
     "dailyFrequency.dates": new Date().setUTCHours(0,0,0,0)
    },
    {
      $inc: {"dailyFrequency.$.counter": 1}
    }
  );
  if (exists2.matchedCount === 0){
    await Url.updateOne(
      {code: url.code},
      {
        $push: { dailyFrequency: {dates: new Date().setUTCHours(0,0,0,0), counter: 1}}
      }
    )
  }
  return res.redirect(302, url.originalUrl);
}

module.exports = { redirect };
