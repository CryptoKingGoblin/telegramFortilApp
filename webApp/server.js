const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// 📡 Vérifier que l'application reçoit des requêtes
app.use((req, res, next) => {
    console.log(`🌐 Requête reçue : ${req.method} ${req.url}`);
    next();
});

// 📂 Servir la WebApp React/Vite depuis "dist"
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Éviter que Railway tue l’application
app.listen(PORT, () => {
    console.log(`🚀 WebApp en ligne sur le port ${PORT}`);
});
