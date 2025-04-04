import { Markup } from "telegraf";

export const getMainMenu = () =>
  Markup.keyboard([
    ["Fileများရယူရန်", "Kotobaများကျက်ရန်"],
    ["Video သင်ခန်းစာများလေ့လာရန်"],
    ["Hikaruမှ ဝယ်ယူနိုင်သည့်ဂျပန်စာအုပ်များ"],
    ["သင်ကြားပုံများ"],
  ])
    .resize()
    .oneTime(false);

export const getInlineKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url("Admin နှင့်ဆက်သွယ်မည်", "https://t.me/hikarujls")],
  ]);

export const getBooksMenu = () =>
  Markup.keyboard([
    ["📗 N5 Books", "📘 N4 Books"],
    ["📙 N3 Books", "📕 N2 Books"],
    ["📚 General Books"],
    ["⬅️ Back"],
  ])
    .resize()
    .oneTime(false);
