const router = require("express").Router();
const { createShortUrl, getStats, listUrls } = require("../controllers/url.controller");

router.get("/", listUrls);
router.post("/", createShortUrl);
router.get("/:code/stats", getStats);

module.exports = router;
