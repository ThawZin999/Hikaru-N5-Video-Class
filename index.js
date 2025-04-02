import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";
import { usersCollection } from "./firebase.js";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: false }); // No polling in webhook mode
const app = express();
const ADMIN_ID = 6057736787; // Your Telegram ID

app.use(express.json());

// ✅ Get approved users from Firestore
const getApprovedUsers = async () => {
  const snapshot = await usersCollection.get();
  return snapshot.docs.map((doc) => Number(doc.id)); // Ensuring numeric IDs
};

// ✅ Add a new user to Firestore
const addUser = async (userId) => {
  await usersCollection.doc(userId.toString()).set({ approved: true });
};

// ✅ Remove a user from Firestore
const removeUser = async (userId) => {
  await usersCollection.doc(userId.toString()).delete();
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

    const APPROVED_USERS = await getApprovedUsers();

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
      if (!newUserId || isNaN(newUserId)) {
        await bot.sendMessage(
          chatId,
          "⚠️ Invalid user ID. Use `/adduser <id>`."
        );
        return res.status(400).send("Invalid user ID.");
      }

      await addUser(newUserId);
      await bot.sendMessage(
        chatId,
        `✅ User ID ${newUserId} added successfully.`
      );
      return res.status(200).send("User added.");
    }

    if (message?.text?.startsWith("/removeuser")) {
      if (userId !== ADMIN_ID) {
        await bot.sendMessage(
          chatId,
          "❌ You are not authorized to remove users."
        );
        return res.status(403).send("Forbidden: Not admin.");
      }

      const removeUserId = parseInt(message.text.split(" ")[1]);
      if (!removeUserId || isNaN(removeUserId)) {
        await bot.sendMessage(
          chatId,
          "⚠️ Invalid user ID. Use `/removeuser <id>`."
        );
        return res.status(400).send("Invalid user ID.");
      }

      await removeUser(removeUserId);
      await bot.sendMessage(
        chatId,
        `✅ User ID ${removeUserId} removed successfully.`
      );
      return res.status(200).send("User removed.");
    }

    // ✅ Display menu options
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

    // ✅ Handle button clicks
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
