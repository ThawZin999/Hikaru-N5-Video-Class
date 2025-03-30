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
app.use(express.json());

app.post("/api/webhook", async (req, res) => {
  try {
    const { message, callback_query } = req.body;

    if (message) {
      const chatId = message.chat.id;
      const userId = message.from.id;

      if (!APPROVED_USERS.includes(userId)) {
        await bot.sendMessage(
          chatId,
          "❌ Sorry, you are not authorized to use this bot."
        );
        return res.sendStatus(403);
      }

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
      const chatId = callback_query.message.chat.id;
      const userId = callback_query.from.id;

      if (!APPROVED_USERS.includes(userId)) {
        await bot.answerCallbackQuery(callback_query.id, {
          text: "❌ Access denied!",
        });
        return res.sendStatus(403);
      }

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

// **Export a function instead of starting an Express server**
export default app;
