const axios = require("axios");

async function getCountryFromIP(ip) {
  const token = process.env.IPINFO_TOKEN;
  if (!token) return "Unknown";

  try {
    const url = `https://ipinfo.io/${ip}?token=${token}`;
    const resp = await axios.get(url, { timeout: 5000 });
    // ipinfo normalmente devuelve "country": "CR", "US", etc.
    return resp.data?.country || "Unknown";
  } catch (e) {
    return "Unknown";
  }
}

module.exports = { getCountryFromIP };
