require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const leadRoutes = require("./routes/leads");
const { errorHandler } = require("./middleware/errorHandler");
const { authenticate } = require("./middleware/auth");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use("/api/auth", authRoutes);
app.use("/api/leads", authenticate, leadRoutes);

app.get("/", (req, res) => res.send("LeadFlow CRM API Running"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 3001, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 3001}`)
    );
  })
  .catch((err) => { console.error("❌ MongoDB error:", err.message); process.exit(1); });
