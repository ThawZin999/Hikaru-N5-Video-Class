import { Markup } from "telegraf";

export const getMainMenu = () =>
  Markup.keyboard([["Daily Lessons", "Units"]])
    .resize()
    .oneTime(false);

export const getInlineKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url("Admin နှင့်ဆက်သွယ်မည်", "https://t.me/hikarujls")],
  ]);
