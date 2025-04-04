import {
  addMessageIds,
  updateMessageIds,
  deleteMessageIds,
  getMessageIds,
} from "./messages.js";

export const setupAdminHandlers = (bot) => {
  // Add message IDs for a category
  bot.command("addmessages", async (ctx) => {
    try {
      const args = ctx.message.text.split(" ");
      if (args.length < 3) {
        await ctx.reply(
          "⚠️ Usage: /addmessages <category> <messageId1,messageId2,...>\n" +
            "Example: /addmessages n5_books 123,124,125"
        );
        return;
      }

      const category = args[1].toLowerCase();
      const messageIds = args[2].split(",").map(Number);

      if (messageIds.some(isNaN)) {
        await ctx.reply(
          "❌ Invalid message IDs. Please provide valid numbers."
        );
        return;
      }

      await addMessageIds(category, messageIds);
      await ctx.reply(`✅ Message IDs added for ${category}`);
    } catch (error) {
      console.error("Error adding message IDs:", error);
      await ctx.reply("❌ Failed to add message IDs.");
    }
  });

  // Update message IDs for a category
  bot.command("updatemessages", async (ctx) => {
    try {
      const args = ctx.message.text.split(" ");
      if (args.length < 3) {
        await ctx.reply(
          "⚠️ Usage: /updatemessages <category> <messageId1,messageId2,...>\n" +
            "Example: /updatemessages n5_books 123,124,125"
        );
        return;
      }

      const category = args[1].toLowerCase();
      const messageIds = args[2].split(",").map(Number);

      if (messageIds.some(isNaN)) {
        await ctx.reply(
          "❌ Invalid message IDs. Please provide valid numbers."
        );
        return;
      }

      await updateMessageIds(category, messageIds);
      await ctx.reply(`✅ Message IDs updated for ${category}`);
    } catch (error) {
      console.error("Error updating message IDs:", error);
      await ctx.reply("❌ Failed to update message IDs.");
    }
  });

  // Delete message IDs for a category
  bot.command("deletemessages", async (ctx) => {
    try {
      const args = ctx.message.text.split(" ");
      if (args.length < 2) {
        await ctx.reply(
          "⚠️ Usage: /deletemessages <category>\n" +
            "Example: /deletemessages n5_books"
        );
        return;
      }

      const category = args[1].toLowerCase();
      await deleteMessageIds(category);
      await ctx.reply(`✅ Message IDs deleted for ${category}`);
    } catch (error) {
      console.error("Error deleting message IDs:", error);
      await ctx.reply("❌ Failed to delete message IDs.");
    }
  });

  // Get message IDs for a category
  bot.command("getmessages", async (ctx) => {
    try {
      const args = ctx.message.text.split(" ");
      if (args.length < 2) {
        await ctx.reply(
          "⚠️ Usage: /getmessages <category>\n" +
            "Example: /getmessages n5_books"
        );
        return;
      }

      const category = args[1].toLowerCase();
      const messageIds = await getMessageIds(category);
      await ctx.reply(
        `📝 Message IDs for ${category}:\n${
          messageIds.join(", ") || "No messages found"
        }`
      );
    } catch (error) {
      console.error("Error getting message IDs:", error);
      await ctx.reply("❌ Failed to get message IDs.");
    }
  });
};
