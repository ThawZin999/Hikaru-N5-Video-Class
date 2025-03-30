import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const APPROVED_USERS = process.env.APPROVED_USERS
  ? process.env.APPROVED_USERS.split(",").map((id) => Number(id.trim()))
  : [];

const bot = new TelegramBot(TOKEN);
const app = express();

// Ensure correct parsing
app.use(express.json());

// Allow Telegram requests
app.post("/api/webhook", async (req, res) => {
  try {
    const { message, callback_query } = req.body;

    if (!message && !callback_query) {
      return res.status(400).send("No valid Telegram update found.");
    }

    const userId = message?.from?.id || callback_query?.from?.id;
    const chatId = message?.chat?.id || callback_query?.message?.chat?.id;

    if (!userId || !chatId) {
      return res.status(400).send("Invalid request data.");
    }

    if (!APPROVED_USERS.includes(userId)) {
      await bot.sendMessage(
        chatId,
        "❌ Sorry, you are not authorized to use this bot."
      );
      return res.status(403).send("Forbidden: User not approved.");
    }

    if (message) {
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📚 Daily Lessons", callback_data: "daily_lessons" }],
            [{ text: "📖 Units", callback_data: "units" }],
          ],
        },
      };

      await bot.sendMessage(
        chatId,
        "Welcome to Hikaru N5 Video Class! Choose an option:",
        options
      );
    }

    if (callback_query) {
      if (callback_query.data === "daily_lessons") {
        await bot.sendMessage(chatId, "📅 Here are your daily lessons...");
      } else if (callback_query.data === "units") {
        await bot.sendMessage(chatId, "📖 Here are the available units...");
      }
      await bot.answerCallbackQuery(callback_query.id);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Correctly export app for Vercel
export default app;
