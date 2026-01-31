const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = "1463623618931068949";
const CODES_URL = "https://wos-codes-api.vercel.app/codes.json";

// Liste des joueurs SEA
const SUBSCRIBERS = [
  "249866798",// Touill
  "248801505",// Blondyie
  "259496198",// LaNormande
  "333162702",// Moi
  "425992001",// Ma ferme
  "250210523",// Sez
  "251029505",//Jenny
  "247556447",//Lawzzy
  "248244287",//Nez qui coule
  "251471924",//Klebledur
  "248031220",//KnightOnline
  "245650686"//Lord Long Dong
];

let lastPosted = new Set();
// Historique des codes envoyés par joueur
let sentCodesByUser = {};


async function checkCodes() {
  let codes = [];

  try {
    const res = await axios.get(CODES_URL);
    codes = res.data;
    console.log("Codes récupérés :", codes);
  } catch (err) {
    console.error("Erreur récupération codes :", err.message);

    if (err.response && err.response.status === 404) {
      console.log("Aucun code disponible pour le moment.");
      return;
    }

    return;
  }

  if (!codes || codes.length === 0) return;

  for (const code of codes) {
    if (lastPosted.has(code.code)) continue;
    
    for (const userId of SUBSCRIBERS) {
   if (!sentCodesByUser[userId]) {
    sentCodesByUser[userId] = new Set();
  }

  if (sentCodesByUser[userId].has(code.code)) continue;

  try {
    const user = await client.users.fetch(userId);
    await user.send(
      `🎁 **Nouveau code Whiteout Survival !**\n\n` +
      `🔑 Code : **${code.code}**\n` +
      `⚡ Activation rapide : https://whiteout-survival.farlightgames.com/redemption?code=${code.code}\n\n` +
      `⏳ Expire : ${code.expires || "Non précisé"}`
    );

    sentCodesByUser[userId].add(code.code);

  } catch (err) {
    console.error(`Impossible d'envoyer un message à ${userId} :`, err.message);
  }
}

    // 🔵 🔵 🔵 3) ICI : envoi automatique aux joueurs enregistrés
    

    lastPosted.add(code.code);
  }
}
// ---------------------------------------------------------

async function checkCodes() {
  let codes = [];

  try {
    const res = await axios.get(CODES_URL);
    codes = res.data;
    console.log("Codes récupérés :", codes);
  } catch (err) {
    console.error("Erreur récupération codes :", err.message);

    if (err.response && err.response.status === 404) {
      console.log("Aucun code disponible pour le moment.");
      return;
    }

    return;
  }

  // Ici tu pourras ajouter le code pour publier les codes dans Discord
}

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  checkCodes();
  setInterval(checkCodes, 10 * 60 * 1000); // toutes les 10 minutes
});

client.login(TOKEN);
