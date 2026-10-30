import "dotenv/config";
import app from "./index.js";

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL belum diatur; endpoint penyimpanan akan mengembalikan 503.");
  }
});
