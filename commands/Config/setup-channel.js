const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-channel')
        .setDescription('Setup the feed channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Feed channel.')
                .setRequired(true)),

    async execute(interaction) {

        if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: 'You need to be an administrator to use this command.', ephemeral: true });

        const channel = interaction.options.getChannel('channel');

        if (channel.type !== 0) {
            return interaction.reply({ content: `You can only set a text channel as the feed channel.`, ephemeral: true });
        };

        const dbGuild = await db.get(`${interaction.guildId}`);

        (async () => {
            await db.set(`${interaction.guildId}`, {"feedChannel":channel.id });
        })();

        const embed = new EmbedBuilder()
        .setTitle('Sucessfully set the feed channel!')
        .setColor(config.colors.success)
        .setDescription(`The feed channel is now ${channel}.`)
        .setFooter({ text: `${config.embed.footer}` })
    
        interaction.reply({ embeds: [embed] });
    }
};