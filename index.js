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
const cron = require("node-cron");
const axios = require("axios");

const ANNOUNCE_CHANNEL = "1467471118167445505"; // Ton canal d'annonces
const TOKEN = process.env.BOT_TOKEN;
const CODES_URL = "https://wos-codes-api.vercel.app/codes.json";

// Liste des joueurs SEA
const SUBSCRIBERS = [
  "249866798","248801505","259496198","333162702","425992001",
  "250210523","251029505","247556447","248244287","251471924",
  "248031220","245650686","243445460","402021115","244839532",
  "243609760","243766758","319506337","493279840","240734096",
  "243511097"
];

let lastPosted = new Set();
let sentCodesByUser = {};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function checkCodes() {
  let codes = [];

  try {
    const res = await axios.get(CODES_URL);
    codes = res.data;
    console.log("Codes récupérés :", codes);
  } catch (err) {
    console.error("Erreur récupération codes :", err.message);
    return;
  }

  if (!codes || codes.length === 0) return;

  for (const code of codes) {
    if (lastPosted.has(code.code)) continue;

    // 🔵 Envoi aux joueurs SEA
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

    // 🔵 Envoi dans ton canal Discord
    try {
      const channel = client.channels.cache.get(ANNOUNCE_CHANNEL);
      if (channel) {
        await channel.send(
          `📢 **Nouveau code Whiteout Survival !**\n\n` +
          `🔑 **${code.code}**\n` +
          `⏳ Expire : ${code.expires || "Non précisé"}`
        );
      }
    } catch (err) {
      console.error("Erreur envoi canal :", err.message);
    }

    lastPosted.add(code.code);
  }
}

client.once("ready", () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  checkCodes();
  setInterval(checkCodes, 10 * 60 * 1000); // toutes les 10 minutes
});

// 🐻 ICI on ajoutera l’annonce programmée pour l’Ours
cron.schedule("0 * * * *", () => {  // Vérifie chaque heure
  const channel = client.channels.cache.get(ANNOUNCE_CHANNEL);
  if (!channel) return;

  const now = new Date();
  const day = now.getUTCDate();
  const month = now.getUTCMonth() + 1; // 1 = janvier, 2 = février
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  // On ne commence qu'à partir du 1er février
  if (month < 2) return;

  // Jour impair → Ours
  const isOursDay = day % 2 === 1;
  if (!isOursDay) return; // Jour pair → rien

   // 🔔 Rappel BT2 → 16h45 UTC
  if (hour === 16 && minute === 45) {
    const embed = {
      title: "⏳ Rappel BT2",
      description: "L’Ours **BT2** arrive dans **15 minutes**.\nPréparez vos troupes !",
      color: 0x00AEEF,
      timestamp: new Date()
    };
    channel.send({ embeds: [embed] });
  }

  // 🔔 Rappel BT1 → 19h45 UTC
  if (hour === 19 && minute === 45) {
    const embed = {
      title: "⏳ Rappel BT1",
      description: "L’Ours **BT1** arrive dans **15 minutes**.\nTous en position !",
      color: 0xFF4500,
      timestamp: new Date()
    };
    channel.send({ embeds: [embed] });
  }

// BT2 → 17h00 UTC
if (hour === 17 && minute === 0) {
  const embed = {
    title: "🐻 BT2 – L’Ours apparaît maintenant !",
    description: "Heure : **17h00 UTC**\n\nPréparez-vous au combat !",
    color: 0x00AEEF,
    timestamp: new Date()
  };
  channel.send({ embeds: [embed] });
}

// BT1 → 20h00 UTC
if (hour === 20 && minute === 0) {
  const embed = {
    title: "🐻 BT1 – L’Ours apparaît maintenant !",
    description: "Heure : **20h00 UTC**\n\nTous en position !",
    color: 0xFF4500,
    timestamp: new Date()
  };
  channel.send({ embeds: [embed] });
}

});


client.login(TOKEN);
