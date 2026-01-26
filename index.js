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

let lastPosted = new Set();

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
