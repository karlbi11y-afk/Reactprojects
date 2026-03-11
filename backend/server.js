import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/booking", (req, res) => {
  const { name, studio, email, phone, message } = req.body || {};

  if (!name || !studio || !email) {
    return res.status(400).json({
      error: "Missing required fields"
    });
  }

  console.log("New booking request", {
    name,
    studio,
    email,
    phone,
    message,
    receivedAt: new Date().toISOString()
  });

  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Ink Revenue API running on http://localhost:${PORT}`);
});
