import TelegramBot from "node-telegram-bot-api";
import express from "express";
import { Telegraf } from "telegraf";
import {
  usersCollection,
  addUser,
  removeUser,
  getApprovedUsers,
} from "../firebase.js";
import { setupLessonHandlers } from "../lessons.js";
import { setupAdminHandlers } from "../admin.js";
import { getMainMenu } from "../menu.js";

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: false }); // No polling in webhook mode
const telegrafBot = new Telegraf(TOKEN);
const app = express();
const ADMIN_ID = 6057736787; // Your Telegram ID

// Set up Telegraf handlers before processing webhooks
setupLessonHandlers(telegrafBot);
setupAdminHandlers(telegrafBot);

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

    // ✅ Handle admin commands
    if (message?.text?.startsWith("/")) {
      const command = message.text.split(" ")[0].toLowerCase();
      const adminCommands = [
        "/adduser",
        "/removeuser",
        "/addmessages",
        "/updatemessages",
        "/deletemessages",
      ];

      if (adminCommands.includes(command)) {
        if (!isAdmin) {
          await bot.sendMessage(
            chatId,
            "❌ You are not authorized to use admin commands."
          );
          return res.status(403).send("Forbidden: Not admin.");
        }

        // Let Telegraf handle the command
        await telegrafBot.handleUpdate(req.body);
        return res.status(200).send("Admin command handled.");
      }
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
      const ctx = {
        telegram: telegrafBot.telegram,
        chat: { id: chatId },
        reply: async (text, extra) => {
          await bot.sendMessage(chatId, text, extra);
        },
      };

      if (callback_query.data === "daily_lessons") {
        await handleLessons(ctx, "daily_lessons");
      } else if (callback_query.data === "units") {
        await handleLessons(ctx, "units");
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
