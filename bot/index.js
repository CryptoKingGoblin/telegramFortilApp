require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

app.use(express.json());

// ✅ Commande /start avec bouton Mini-App
bot.start((ctx) => {
    ctx.reply("Bienvenue ! Cliquez ci-dessous pour ouvrir l'application.", {
        reply_markup: {
            inline_keyboard: [[{ text: "📲 Ouvrir l'App", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

// ✅ Gérer les requêtes WebApp
bot.on("web_app_data", (ctx) => {
    const data = JSON.parse(ctx.webAppData.data);
    ctx.reply(`📊 Résultat reçu :
    🔢 Valeur 1 : ${data.valeur1}
    🔢 Valeur 2 : ${data.valeur2}`);
});

// ✅ Webhook pour Railway
app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});


const PORT = process.env.PORT || 3000;
console.log(`🚀 Bot en ligne sur le port ${PORT}`);

// Webhook pour gérer les requêtes Telegram
app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// Serveur Express pour empêcher Railway d'arrêter l'app
app.listen(PORT, () => {
    console.log(`🌍 Serveur Express en écoute sur le port ${PORT}`);
});


bot.launch({ dropPendingUpdates: true });
console.log("🤖 Bot lancé en mode Webhook !");

