require("dotenv").config();

const express = require("express");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// Telegram Bot
// =========================

if (!process.env.BOT_TOKEN) {
  console.error("❌ BOT_TOKEN is missing!");
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "🎬 Welcome to Video Player Bot!\n\n" +
      "Send me a DiskWala video link and I'll create a button to watch it.",
  );
});

bot.on("text", async (ctx) => {
  const videoUrl = ctx.message.text.trim();

  // Check URL
  try {
    const url = new URL(videoUrl);

    if (!url.protocol.startsWith("http")) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return ctx.reply("❌ Please send a valid video URL.");
  }

  // Open the original video/page URL directly
  await ctx.reply(
    "🎬 Video Ready!\n\n" + "Tap the button below to watch the video:",
    Markup.inlineKeyboard([[Markup.button.url("▶️ Watch Video", videoUrl)]]),
  );
});

bot.catch((err) => {
  console.error("❌ Bot error:", err);
});

// =========================
// Render Web Server
// =========================

app.get("/", (req, res) => {
  res.send("🤖 Telegram Video Player Bot is running!");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

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
