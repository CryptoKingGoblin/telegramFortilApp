const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

const distPath = path.join(__dirname, "dist");

// ✅ Vérifier que le dossier `/dist/` existe
if (!fs.existsSync(distPath)) {
    console.error("❌ ERREUR : Le dossier 'dist' n'existe pas !");
    process.exit(1);
}

console.log("📁 Contenu du dossier 'dist':", fs.readdirSync(distPath));

// 📂 Servir la WebApp React/Vite
app.use(express.static(distPath));

app.get("*", (req, res) => {
    console.log("🌐 Requête reçue :", req.url);
    res.sendFile(path.join(distPath, "index.html"));
});

// ✅ Démarrer Express
app.listen(PORT, () => {
    console.log(`🚀 WebApp en ligne sur le port ${PORT}`);
});
