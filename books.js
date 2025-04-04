import { Markup } from "telegraf";
import { getMessageIds } from "./messages.js";

const groupId = -1002476040515; // Your group's chat ID

const handleBooks = async (ctx, category) => {
  try {
    const messageIds = await getMessageIds(category);
    if (!messageIds || messageIds.length === 0) {
      await ctx.reply("Sorry, no books available in this category. 🙇🏻‍♂️");
      return;
    }

    for (const messageId of messageIds) {
      await ctx.telegram.copyMessage(ctx.chat.id, groupId, messageId);
    }

    await ctx.reply(
      "အချို့စာအုပ်များကိုဂိုဒေါင်ရှင်းအထူးလျှော့ဈေးဖြင့်ပေးထားပါတယ်။\nစာအုပ်ဝယ်ယူရန်အတွက် ဝယ်ယူမည့်စာအုပ်၏ codeကိုမှတ်ပြီး Adminနှင့်တိုက်ရိုက်ဆက်သွယ်မှာယူနိုင်ပါတယ်ခင်ဗျာ👇",
      Markup.inlineKeyboard([
        Markup.button.url("Admin နှင့်ဆက်သွယ်မည်", "https://t.me/hikarujls"),
      ])
    );
  } catch (error) {
    console.error("Error forwarding message:", error);
    await ctx.reply("Sorry, There is a error. 🙇🏻‍♂️");
  }
};

export const setupBookHandlers = (bot) => {
  bot.hears("Hikaruမှ ဝယ်ယူနိုင်သည့်ဂျပန်စာအုပ်များ", (ctx) => {
    ctx.reply(
      "📚 Choose your Japanese level:",
      Markup.keyboard([
        ["📗 N5 Books", "📘 N4 Books"],
        ["📙 N3 Books", "📕 N2 Books"],
        ["📚 General Books"],
        ["⬅️ Back"],
      ])
        .resize()
        .oneTime(false)
    );
  });

  bot.hears("📗 N5 Books", async (ctx) => {
    await handleBooks(ctx, "n5_books");
  });

  bot.hears("📘 N4 Books", async (ctx) => {
    await handleBooks(ctx, "n4_books");
  });

  bot.hears("📙 N3 Books", async (ctx) => {
    await handleBooks(ctx, "n3_books");
  });

  bot.hears("📕 N2 Books", async (ctx) => {
    await handleBooks(ctx, "n2_books");
  });

  bot.hears("📚 General Books", async (ctx) => {
    await handleBooks(ctx, "general_books");
  });
};
