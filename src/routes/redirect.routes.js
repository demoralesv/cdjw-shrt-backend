const router = require("express").Router();
const { redirect } = require("../controllers/redirect.controller");

router.get("/:code", redirect);

module.exports = router;
