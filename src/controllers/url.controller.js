const { nanoid } = require("nanoid");
const Url = require("../models/Url");


function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function createShortUrl(req, res) {
  const { originalUrl } = req.body;
  if (!originalUrl || !isValidHttpUrl(originalUrl)) {
    return res.status(400).json({ error: "URL inválida" });
  }

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) return res.status(500).json({ error: "BASE_URL no configurada" });

  // Si ya existe la URL, opcional: devolver la existente
  const existing = await Url.findOne({ originalUrl }).lean();
  if (existing) return res.json(existing);

  const code = nanoid(7);
  const shortUrl = `${baseUrl}/${code}`;

  const doc = await Url.create({ originalUrl, code, shortUrl, baseUrl });
  return res.status(201).json(doc);
}

async function listUrls(req, res) {
  const UrlModel = require("../models/Url");
  const urls = await UrlModel.find({}, { originalUrl: 1, code: 1, createdAt: 1 })
    .sort({ originalUrl: 1 })
    .lean();

  res.json(urls);
}

async function getStats(req, res) {
  const { code } = req.params;
  const UrlModel = require("../models/Url");
  const AccessLog = require("../models/AccessLog");

  const url = await UrlModel.findOne({ code }).lean();
  if (!url) return res.status(404).json({ error: "No existe" });

  const urlId = url._id;

  const totalAccesses = await AccessLog.countDocuments({ urlId });

  const countryCounts = (url.countries || [])
    .map((c) => ({ country: c.name, count: c.counter }))
    .sort((a, b) => b.count - a.count);



  // frecuencia por día (YYYY-MM-DD)
  const dailyFrequency = await AccessLog.aggregate([
    { $match: { urlId } },
    {
      $addFields: {
        // Convertir la fecha a Costa Rica (UTC-6)
        accessedAtCR: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateSubtract: {
                startDate: "$accessedAt",
                unit: "hour",
                amount: 6  // Restar 6 horas para ajustarse a la hora de Costa Rica (UTC-6)
              }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$accessedAtCR",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", count: 1 } }
  ]);

  res.json({
    code: url.code,
    originalUrl: url.originalUrl,
    shortUrl: url.shortUrl,
    createdAt: url.createdAt,
    totalAccesses,
    countryCounts,
    dailyFrequency
  });
}

module.exports = { createShortUrl, getStats, listUrls };
