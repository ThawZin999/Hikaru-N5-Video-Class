import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const APPROVED_USERS = process.env.APPROVED_USERS
  ? process.env.APPROVED_USERS.split(",").map((id) => Number(id.trim()))
  : [];

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!APPROVED_USERS.includes(userId)) {
    bot.sendMessage(
      chatId,
      "❌ Sorry, you are not authorized to use this bot."
    );
    return;
  }

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📚 Daily Lessons", callback_data: "daily_lessons" }],
        [{ text: "📖 Units", callback_data: "units" }],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    "Welcome to Hikaru N5 Video Class! Choose an option:",
    options
  );
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (!APPROVED_USERS.includes(userId)) {
    bot.answerCallbackQuery(query.id, { text: "❌ Access denied!" });
    return;
  }

  if (query.data === "daily_lessons") {
    bot.sendMessage(chatId, "📅 Here are your daily lessons...");
  } else if (query.data === "units") {
    bot.sendMessage(chatId, "📖 Here are the available units...");
  }

  bot.answerCallbackQuery(query.id);
});
