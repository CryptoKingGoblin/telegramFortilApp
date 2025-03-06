const express = require("express");
const { Telegraf } = require("telegraf");

const app = express();
const PORT = process.env.PORT || 3000;
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ✅ Désactiver complètement le polling et forcer le webhook
const BOT_URL = process.env.BOT_URL; // URL Railway du bot
if (!BOT_URL) {
    console.error("❌ ERREUR : BOT_URL est manquant dans les variables d’environnement !");
    process.exit(1);
}

bot.telegram.setWebhook(`${BOT_URL}/webhook`).then(() => {
    console.log("✅ Webhook configuré !");
}).catch(err => {
    console.error("❌ Erreur Webhook :", err);
});

// ✅ Webhook pour recevoir les requêtes de Telegram
app.use(express.json());
app.post("/webhook", (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

// ✅ Route de test pour vérifier si le bot tourne bien
app.get("/", (req, res) => {
    res.send("🚀 Bot Telegram en ligne !");
});

// ✅ Lancer le serveur Express
app.listen(PORT, () => {
    console.log(`🌍 Serveur Express en écoute sur le port ${PORT}`);
});

// ✅ Commande /start pour tester
bot.start((ctx) => {
    ctx.reply("Bienvenue ! Cliquez ci-dessous pour ouvrir l'application.", {
        reply_markup: {
            inline_keyboard: [[{ text: "📲 Ouvrir l'App", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

// ✅ Gérer les données envoyées par la WebApp
bot.on("web_app_data", (ctx) => {
    const data = JSON.parse(ctx.webAppData.data);
    ctx.reply(`📊 Résultat reçu :
    🔢 Valeur 1 : ${data.valeur1}
    🔢 Valeur 2 : ${data.valeur2}`);
});
