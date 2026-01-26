const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Ton token sera ajouté dans les variables d'environnement sur Koyeb
const TOKEN = process.env.BOT_TOKEN;

// ID du canal où poster les codes
const CHANNEL_ID = "1463623618931068949";

// Source automatique des codes
const CODES_URL = "https://wos-codes-api.vercel.app/codes.json";

/ 🔵 🔵 🔵 1) ICI : tu colles la liste des joueurs à notifier
// ---------------------------------------------------------
const SUBSCRIBERS = [
  "249866798",
  "ID_JOUEUR_2",
  "ID_JOUEUR_3"
];
// ---------------------------------------------------------

let lastPosted = new Set();

// 🔵 🔵 🔵 2) ICI : tu colles la fonction complète checkCodes()
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

  if (!codes || codes.length === 0) return;

  for (const code of codes) {
    if (lastPosted.has(code.code)) continue;

    // 🔵 🔵 🔵 3) ICI : envoi automatique aux joueurs enregistrés
    for (const userId of SUBSCRIBERS) {
      try {
        const user = await client.users.fetch(userId);
        await user.send(
          `🎁 **Nouveau code Whiteout Survival !**\n\n` +
          `🔑 Code : **${code.code}**\n` +
          `⚡ Activation rapide : https://whiteout-survival.farlightgames.com/redemption?code=${code.code}\n\n` +
          `⏳ Expire : ${code.expires || "Non précisé"}`
        );
      } catch (err) {
        console.error(`Impossible d'envoyer un message à ${userId} :`, err.message);
      }
    }

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
