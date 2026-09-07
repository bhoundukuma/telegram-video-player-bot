require("dotenv").config();

const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const PORT = process.env.PORT || 3000;

// Health-check endpoint for Render
app.get("/", (req, res) => {
  res.send("🤖 Telegram Video Player Bot is running!");
});

// Start HTTP server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 HTTP server running on port ${PORT}`);
});

bot.start((ctx) => {
  ctx.reply(
    "🎬 Welcome to Video Player Bot!\n\n" +
    "Send me a direct video URL and I'll create a Play Online button."
  );
});

bot.on("text", async (ctx) => {
  const videoUrl = ctx.message.text.trim();

  try {
    new URL(videoUrl);
  } catch {
    return ctx.reply("❌ Please send a valid video URL.");
  }

  const playerUrl =
    `${process.env.PLAYER_URL}/?video=${encodeURIComponent(videoUrl)}`;

  await ctx.reply(
    "🎬 Video Ready!\n\n" +
    "Tap the button below to watch:",
    Markup.inlineKeyboard([
      [
        Markup.button.url("▶️ Play Online", playerUrl)
      ]
    ])
  );
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

bot.launch();

console.log("🤖 Telegram bot is running...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
