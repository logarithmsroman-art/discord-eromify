const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { supabase } = require('../../utils/supabase');
const adminHandler = require('../../handlers/adminHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban-affiliate')
        .setDescription('Admin only: Remove a user from the affiliate program 🚫')
        .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for the ban').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        // Delete from DB (or optionally flag as inactive)
        const { error } = await supabase.from('affiliates').delete().eq('discord_id', user.id);

        if (error) {
            return interaction.reply({ content: `Error banning user: ${error.message}`, ephemeral: true });
        }

        await adminHandler.logAction('BAN', interaction.user.username, user.id, reason);

        await interaction.reply({ content: `**${user.tag}** has been removed from the affiliate program. 🚫`, ephemeral: true });
    },
};
