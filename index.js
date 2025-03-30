import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN);
const app = express();
const ADMIN_ID = 6057736787; // Replace with your real Telegram ID

app.use(express.json());

// Function to read approved users
const getApprovedUsers = () => {
  try {
    const data = fs.readFileSync("approvedUsers.json", "utf8");
    return JSON.parse(data).users || [];
  } catch (error) {
    console.error("Error reading approved users:", error);
    return [];
  }
};

// Function to add new users
const addUser = (userId) => {
  try {
    const approvedUsers = getApprovedUsers();
    if (!approvedUsers.includes(userId)) {
      approvedUsers.push(userId);
      fs.writeFileSync(
        "approvedUsers.json",
        JSON.stringify({ users: approvedUsers }, null, 2)
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating approved users:", error);
    return false;
  }
};

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

    const APPROVED_USERS = getApprovedUsers();

    if (!APPROVED_USERS.includes(userId)) {
      await bot.sendMessage(
        chatId,
        "❌ Sorry, you are not authorized to use this bot."
      );
      return res.status(403).send("Forbidden: User not approved.");
    }

    if (message?.text?.startsWith("/adduser")) {
      if (userId !== ADMIN_ID) {
        await bot.sendMessage(
          chatId,
          "❌ You are not authorized to add users."
        );
        return res.status(403).send("Forbidden: Not admin.");
      }

      const newUserId = parseInt(message.text.split(" ")[1]);
      if (!newUserId) {
        await bot.sendMessage(
          chatId,
          "⚠️ Invalid user ID. Use `/adduser <id>`."
        );
        return res.status(400).send("Invalid user ID.");
      }

      if (addUser(newUserId)) {
        await bot.sendMessage(
          chatId,
          `✅ User ID ${newUserId} added successfully.`
        );
      } else {
        await bot.sendMessage(
          chatId,
          `⚠️ User ID ${newUserId} is already approved.`
        );
      }
    } else {
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

// ✅ Export app for Vercel
export default app;
