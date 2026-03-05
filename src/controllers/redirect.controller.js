const Url = require("../models/Url");
const AccessLog = require("../models/AccessLog");
const { getCountryFromIP } = require("../services/geoip.service");

// Obtener la fecha en la zona horaria de Costa Rica (UTC-6)
const crDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Costa_Rica' }));
crDate.setUTCHours(0, 0, 0, 0);

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
     "dailyFrequency.dates": crDate
    },
    {
      $inc: {"dailyFrequency.$.counter": 1}
    }
  );
  if (exists2.matchedCount === 0){
    await Url.updateOne(
      {code: url.code},
      {
        $push: { dailyFrequency: {dates: crDate, counter: 1}}
      }
    )
  }
  return res.redirect(302, url.originalUrl);
}

module.exports = { redirect };
