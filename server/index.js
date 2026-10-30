import express from "express";
import { neon } from "@neondatabase/serverless";

const app = express();
const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", async (_request, response) => {
  if (!sql) {
    return response.json({
      status: "ok",
      databaseConfigured: false,
      databaseConnected: false,
    });
  }

  try {
    await sql`SELECT 1`;
    return response.json({
      status: "ok",
      databaseConfigured: true,
      databaseConnected: true,
    });
  } catch (error) {
    console.error("Neon health check failed:", error);
    return response.status(503).json({
      status: "error",
      databaseConfigured: true,
      databaseConnected: false,
      error: "Tidak dapat terhubung ke database Neon.",
    });
  }
});

app.post("/api/contact", async (request, response) => {
  if (!sql) {
    return response.status(503).json({ error: "Database belum dikonfigurasi." });
  }

  const { name, email, message } = request.body ?? {};
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !message.trim() ||
    name.length > 100 ||
    email.length > 254 ||
    message.length > 5000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return response.status(400).json({ error: "Periksa kembali nama, email, dan pesanmu." });
  }

  try {
    await sql`
      INSERT INTO contact_messages (name, email, message)
      VALUES (${name.trim()}, ${email.trim()}, ${message.trim()})
    `;
    return response.status(201).json({ message: "Pesan berhasil dikirim." });
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return response.status(500).json({ error: "Pesan belum berhasil disimpan. Coba lagi nanti." });
  }
});

app.get("/api/comments", async (_request, response) => {
  if (!sql) {
    return response.status(503).json({ error: "Database belum dikonfigurasi." });
  }

  try {
    const comments = await sql`
      SELECT id, name, comment, created_at
      FROM reader_comments
      WHERE publish_consent = TRUE
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return response.json({ comments });
  } catch (error) {
    console.error("Failed to load reader comments:", error);
    return response.status(500).json({ error: "Komentar belum berhasil dimuat." });
  }
});

app.post("/api/comments", async (request, response) => {
  if (!sql) {
    return response.status(503).json({ error: "Database belum dikonfigurasi." });
  }

  const { name, whatsapp, comment, publishConsent } = request.body ?? {};
  const normalizedWhatsapp =
    typeof whatsapp === "string" ? whatsapp.replace(/[\s()-]/g, "") : "";

  if (
    typeof name !== "string" ||
    typeof comment !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    !/^\+?[0-9]{8,15}$/.test(normalizedWhatsapp) ||
    !comment.trim() ||
    comment.trim().length > 1000 ||
    publishConsent !== true
  ) {
    return response.status(400).json({
      error: "Periksa nama, nomor WhatsApp, komentar, dan persetujuan publikasi.",
    });
  }

  try {
    const [savedComment] = await sql`
      INSERT INTO reader_comments (name, whatsapp, comment, publish_consent)
      VALUES (${name.trim()}, ${normalizedWhatsapp}, ${comment.trim()}, TRUE)
      RETURNING id, name, comment, created_at
    `;
    return response.status(201).json({
      message: "Komentar berhasil dikirim dan ditampilkan.",
      comment: savedComment,
    });
  } catch (error) {
    console.error("Failed to save reader comment:", error);
    return response.status(500).json({ error: "Komentar belum berhasil disimpan." });
  }
});

app.post("/api/visits/location", async (request, response) => {
  if (!sql) {
    return response.status(503).json({ error: "Database belum dikonfigurasi." });
  }

  const { latitude, longitude, consent } = request.body ?? {};
  if (
    consent !== true ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return response.status(400).json({ error: "Persetujuan atau koordinat lokasi tidak valid." });
  }

  try {
    await sql`
      INSERT INTO visitor_locations (latitude, longitude, consent_given)
      VALUES (${latitude}, ${longitude}, TRUE)
    `;
    return response.status(201).json({ message: "Lokasi perkiraan berhasil disimpan." });
  } catch (error) {
    console.error("Failed to save visitor location:", error);
    return response.status(500).json({ error: "Lokasi belum berhasil disimpan." });
  }
});

export default app;
