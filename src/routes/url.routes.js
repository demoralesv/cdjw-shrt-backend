const router = require("express").Router();
const { createShortUrl, getStats } = require("../controllers/url.controller");

router.post("/", createShortUrl);
router.get("/:code/stats", getStats);

module.exports = router;
