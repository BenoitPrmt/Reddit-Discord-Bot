const { GatewayIntentBits, Client, Collection } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const new_posts = require('./scanning/new-posts');
const { BOT_TOKEN } = require('./token.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages]
});

const fs = require('fs');

async function initDB() {
    const posts = await new_posts.newPosts(10);

    await db.set("lastPost", { "id": posts[0].id, "time": posts[0].time });

    const guilds = client.guilds.cache.map(guild => guild.id);
    for (const guild of guilds) {
        const dbGuild = await db.get(`${guild}`);
        if (!dbGuild) {
            await db.set(`${guild}`, { "feedChannel": null });
        };
    };
};
initDB();

const commands = [];

// COLLECTION FOR COMMANDS
client.commands = new Collection();

// COMMANDS HANDLER
const loadCommands = (dir = './commands/') => {
    fs.readdirSync(dir).forEach(dirs => {
        const commandsList = fs.readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

        for (const file of commandsList) {
            const command = require(`${dir}/${dirs}/${file}`);
            commands.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
            console.log(`[COMMAND] - Commande chargée : ${command.data.name}`);
        };
    });
};
loadCommands();

module.exports = commands;

// EVENTS HANDLER
const loadEvents = (dir = './events/') => {
    fs.readdirSync(dir).forEach(dirs => {
        const events = fs.readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));

        for (const event of events) {
            const evt = require(`${dir}/${dirs}/${event}`);
            const evtName = event.split(".")[0];
            client.on(evtName, evt.bind(null, client));
            console.log(`[EVENT] - Évenement chargé : ${evtName}`);
        };
    });
};
loadEvents();

// LOGIN
client.login(BOT_TOKEN);