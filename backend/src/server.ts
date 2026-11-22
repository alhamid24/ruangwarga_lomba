
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import superAdminRoutes from "./routes/super-admin.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Backend Ruang Warga berhasil berjalan!",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    const result = await db.query("SELECT NOW() AS waktu_server");

    res.json({
      success: true,
      message: "Koneksi PostgreSQL berhasil!",
      database_time: result.rows[0].waktu_server,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Koneksi database gagal",
    });
  }
});

app.get("/api/roles", async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT id, code, name, description FROM roles ORDER BY id"
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch roles:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data roles",
    });
  }
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Ruang Warga backend berjalan di port ${PORT}`);
});
