const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const adminHandler = require('../../handlers/adminHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('Admin only: Send a global announcement! 📣')
        .addChannelOption(opt => opt.setName('channel').setDescription('Channel to post in').setRequired(true))
        .addStringOption(opt => opt.setName('message').setDescription('Main message/announcement').setRequired(true))
        .addStringOption(opt => opt.setName('title').setDescription('Announcement Title').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message').replace(/\\n/g, '\n');
        const title = interaction.options.getString('title') || 'Affiliate Update! 🍑✨';

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setColor('#FF006E')
            .setTimestamp()
            .setFooter({ text: 'Eromify Admin Team' });

        try {
            await channel.send({ embeds: [embed] });
            await adminHandler.logAction('BROADCAST', interaction.user.username, channel.id, message);
            await interaction.reply({ content: `Announcement broadcast to **<#${channel.id}>**! 📡`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `Failed to send message: ${error.message}`, ephemeral: true });
        }
    },
};
