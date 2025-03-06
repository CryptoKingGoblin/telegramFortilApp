const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Vérifier que le serveur démarre bien
console.log("🟢 Démarrage du serveur Express...");
console.log("📂 Vérification du dossier 'dist'...");

const fs = require("fs");
const distPath = path.join(__dirname, "dist");
if (!fs.existsSync(distPath)) {
    console.error("❌ ERREUR : Le dossier 'dist' est introuvable !");
    process.exit(1); // 🔴 Forcer l'arrêt si le dossier est manquant
}

// 📂 Servir les fichiers React/Vite depuis "dist"
app.use(express.static(distPath));

app.get("*", (req, res) => {
    console.log(`🌐 Requête reçue : ${req.method} ${req.url}`);
    res.sendFile(path.join(distPath, "index.html"));
});

// ✅ Écouter le port
app.listen(PORT, () => {
    console.log(`🚀 WebApp en ligne sur le port ${PORT}`);
});
