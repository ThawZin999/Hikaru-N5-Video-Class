import { getMessageIds } from "./messages.js";
import { getInlineKeyboard } from "./menu.js";

const groupId = -1002476040515; // Your group's chat ID

const handleLessons = async (ctx, category) => {
  try {
    const messageIds = await getMessageIds(category);
    if (!messageIds || messageIds.length === 0) {
      await ctx.reply("Sorry, no lessons available in this category. 🙇🏻‍♂️");
      return;
    }

    for (const messageId of messageIds) {
      await ctx.telegram.copyMessage(ctx.chat.id, groupId, messageId);
    }

    await ctx.reply(
      "အခက်အခဲရှိပါက Admin နှင့်တိုက်ရိုက်ဆက်သွယ်နိုင်ပါတယ်ခင်ဗျာ👇",
      getInlineKeyboard()
    );
  } catch (error) {
    console.error("Error forwarding message:", error);
    await ctx.reply("Sorry, there is an error. 🙇🏻‍♂️");
  }
};

export const setupLessonHandlers = (bot) => {
  bot.hears("Daily Lessons", async (ctx) => {
    await handleLessons(ctx, "daily_lessons");
  });

  bot.hears("Units", async (ctx) => {
    await handleLessons(ctx, "units");
  });
};
