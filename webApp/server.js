const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// 📂 Servir les fichiers React/Vite
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    console.log("📡 Requête reçue !");
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Vérifier que le serveur écoute bien
app.listen(PORT, () => {
    console.log(`🚀 WebApp en ligne sur le port ${PORT}`);
});
