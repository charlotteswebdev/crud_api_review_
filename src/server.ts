import 'dotenv/config';
import app from "./app";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);

if (Number.isNaN(PORT)) {
  throw new Error("Invalid PORT environment variable");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});