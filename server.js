require("dotenv").config();

const express = require("express");
const path = require("path");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// Express Web Server
// =========================

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check for Render
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// =========================
// Telegram Bot
// =========================

if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing!");
  process.exit(1);
}

if (!process.env.PLAYER_URL) {
  console.error("❌ PLAYER_URL is missing!");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "🎬 Welcome to Video Player Bot!\n\n" +
      "Send me a direct video URL and I'll create a Play Online button.",
  );
});

bot.on("text", async (ctx) => {
  const videoUrl = ctx.message.text.trim();

  try {
    new URL(videoUrl);
  } catch {
    return ctx.reply("❌ Please send a valid video URL.");
  }

  const playerUrl = `${process.env.PLAYER_URL}/?video=${encodeURIComponent(videoUrl)}`;

  await ctx.reply(
    "🎬 Video Ready!\n\n" + "Tap the button below to watch:",
    Markup.inlineKeyboard([[Markup.button.url("▶️ Play Online", playerUrl)]]),
  );
});

bot.catch((err) => {
  console.error("❌ Bot error:", err);
});

// =========================
// Start Server + Bot
// =========================

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🌐 Server running on port ${PORT}`);

  try {
    await bot.launch();
    console.log("🤖 Telegram bot is running...");
  } catch (error) {
    console.error("❌ Failed to start Telegram bot:", error);
  }
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
