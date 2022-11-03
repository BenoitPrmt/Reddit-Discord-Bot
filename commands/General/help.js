const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const new_posts = require('../../scanning/new-posts.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show the help message.'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('Help')
            .setColor(config.colors.default)
            .addFields({ name: 'Commands', value: '```\n' + interaction.client.commands.map(command => [command.data.name + " | " + command.data.description]).join('\n') + '```' })
            .setFooter({ text: `${config.embed.footer}` })

        interaction.reply({ embeds: [embed] });
        
    }
}