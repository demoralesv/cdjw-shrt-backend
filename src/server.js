require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const urlRoutes = require("./routes/url.routes");
const redirectRoutes = require("./routes/redirect.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.set("trust proxy", true);
// Rutas API
app.use("/api/urls", urlRoutes);

// Ruta pública de redirección
app.use("/u", redirectRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API running on port ${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
