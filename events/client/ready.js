// REQUIRE
config = require('../../config.json');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = require('../../main.js');
const auto_sending = require('../../scanning/auto-sending.js');

module.exports = async (client, message, guild) => {

    TOKEN = BOT_TOKEN_HERE;
    TEST_GUILD_ID = ''

    console.log('[SLASH] - Registing commands...');

    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '10'
    }).setToken(TOKEN);

    (async () => {
        try {
            console.log('[SLASH] - Checking guild...');
            if (!TEST_GUILD_ID) {
                console.log('[SLASH] - No testing guild...');
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                        body: commands
                    },
                );
                console.log('[SLASH] - Successfully registered application commands globally');
            } else {
                console.log('[SLASH] - Testing guild...');
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                        body: commands
                    },
                );
                console.log('[SLASH] - Successfully registered application commands for development guild');
            }
        } catch (error) {
            if (error) console.error(error);
        }
    })();

    // PRÊT
    console.log(`[READY] - Connecté sur ${client.user.tag} !`);

    // AUTO-SENDING
    auto_sending.autoSendPosts(client);

    // BOT STATUT
    let activities = ['Reddit Bot !', 'I use / commands !'], i = 0;
    setInterval(() => client.user.setPresence({ activities: [{ name: `${activities[i++ % activities.length]}`, type: 'WATCHING', url: 'http://twitch.tv/cloudy' }], status: 'online' }), 20000);
};