import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { Telegraf } from "telegraf";
import {
  usersCollection,
  addUser,
  removeUser,
  getApprovedUsers,
} from "../firebase.js";
import { setupBookHandlers } from "../books.js";
import { setupAdminHandlers } from "../admin.js";
import { getMainMenu } from "../menu.js";

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: false }); // No polling in webhook mode
const telegrafBot = new Telegraf(TOKEN);
const app = express();
const ADMIN_ID = 6057736787; // Your Telegram ID

app.use(express.json());

// ✅ Handle webhook requests
app.post("/api/webhook", async (req, res) => {
  console.log("ℹ️ Webhook received:", JSON.stringify(req.body, null, 2));

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

    const APPROVED_USERS = await getApprovedUsers();
    console.log(`ℹ️ Approved users: ${APPROVED_USERS}`);

    const isAdmin = userId === ADMIN_ID;
    const isApproved = APPROVED_USERS.map(String).includes(String(userId));

    // ✅ Block unauthorized users
    if (!isAdmin && !isApproved) {
      console.log(`❌ User ${userId} is not authorized.`);

      // Only reply if it's a command
      if (message?.text?.startsWith("/")) {
        await bot.sendMessage(
          chatId,
          "❌ You are not authorized to use this bot."
        );
      }

      return res.status(200).send("Unauthorized user handled.");
    }

    console.log("✅ Authorized user, processing request...");

    // ✅ Handle /adduser
    if (message?.text?.startsWith("/adduser")) {
      if (!isAdmin) {
        await bot.sendMessage(
          chatId,
          "❌ You are not authorized to add users."
        );
        return res.status(403).send("Forbidden: Not admin.");
      }

      const args = message.text.split(" ");
      if (args.length < 2 || !/^\d+$/.test(args[1])) {
        await bot.sendMessage(
          chatId,
          "⚠️ Usage: `/adduser <user_id>` (numeric ID required)"
        );
        return res.status(400).send("Invalid command usage.");
      }

      const newUserId = parseInt(args[1], 10);

      try {
        await addUser(newUserId);
        await bot.sendMessage(
          chatId,
          `✅ User ID ${newUserId} added successfully.`
        );
        return res.status(200).send("User added.");
      } catch (error) {
        console.error("❌ Error adding user to Firestore:", error);
        await bot.sendMessage(
          chatId,
          "❌ Failed to add user. Please try again."
        );
        return res.status(500).send("Firestore error.");
      }
    }

    // ✅ Handle /removeuser
    if (message?.text?.startsWith("/removeuser")) {
      if (!isAdmin) {
        await bot.sendMessage(
          chatId,
          "❌ You are not authorized to remove users."
        );
        return res.status(403).send("Forbidden: Not admin.");
      }

      const args = message.text.split(" ");
      const removeUserId = parseInt(args[1], 10);

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

    // ✅ Show menu for /start or general messages
    if (message?.text?.startsWith("/start")) {
      await telegrafBot.telegram.sendMessage(
        chatId,
        "Welcome to Hikaru N5 Video Class! Choose an option:",
        getMainMenu()
      );
      return res.status(200).send("Start command handled.");
    }

    // ✅ Handle Button Clicks
    if (callback_query) {
      if (callback_query.data === "daily_lessons") {
        await bot.sendMessage(chatId, "📅 Here are your daily lessons...");
      } else if (callback_query.data === "units") {
        await bot.sendMessage(chatId, "📖 Here are the available units...");
      }
      await bot.answerCallbackQuery(callback_query.id);
    }

    // Set up Telegraf handlers
    setupBookHandlers(telegrafBot);
    setupAdminHandlers(telegrafBot);

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Export app for Vercel
export default app;
