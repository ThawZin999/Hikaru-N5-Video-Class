import TelegramBot from "node-telegram-bot-api";
import express from "express";
import {
  usersCollection,
  addUser,
  removeUser,
  getApprovedUsers,
} from "./firebase.js";

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: false }); // No polling in webhook mode
const app = express();
const ADMIN_ID = 6057736787; // Your Telegram ID

app.use(express.json());

// ✅ Handle webhook requests
app.post("/api/webhook", async (req, res) => {
  console.log("ℹ️ Webhook received:", JSON.stringify(req.body, null, 2)); // Debugging

  try {
    const { message, callback_query } = req.body;

    if (!message && !callback_query) {
      console.log("⚠️ No valid message or callback received.");
      return res.status(400).send("No valid Telegram update found.");
    }

    const userId = message?.from?.id || callback_query?.from?.id;
    const chatId = message?.chat?.id || callback_query?.message?.chat?.id;

    if (!userId || !chatId) {
      console.log("⚠️ Missing userId or chatId.");
      return res.status(400).send("Invalid request data.");
    }

    const APPROVED_USERS = await getApprovedUsers(); // 🔥 Fix: Ensure Firestore reads properly
    console.log(`ℹ️ Approved users: ${APPROVED_USERS}`);

    // Allow admin to bypass the approval check
    if (userId !== ADMIN_ID && !APPROVED_USERS.includes(userId)) {
      console.log(`❌ User ${userId} is not authorized.`);
      await bot.sendMessage(
        chatId,
        "❌ You are not authorized to use this bot."
      );
      return res.status(403).send("Forbidden: User not approved.");
    }

    console.log("✅ Authorized user, processing request...");

    // ✅ Handle Admin Commands
    if (message?.text?.startsWith("/adduser")) {
      if (userId !== ADMIN_ID) {
        await bot.sendMessage(
          chatId,
          "❌ You are not authorized to add users."
        );
        return res.status(403).send("Forbidden: Not admin.");
      }

      const newUserId = message.text.replace("/adduser", "").trim();
      if (!/^\d+$/.test(newUserId)) {
        await bot.sendMessage(
          chatId,
          "⚠️ Please provide a valid numeric user ID"
        );
        return res.status(400).send("Invalid user ID format");
      }

      await addUser(parseInt(newUserId));
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

      const removeUserId = parseInt(message.text.split(" ")[1]); // Extract user ID
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

    // ✅ Display Menu Options for Authorized Users
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

    // ✅ Handle Button Clicks
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
    console.error("❌ Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Export app for Vercel
export default app;
