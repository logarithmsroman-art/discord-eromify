const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const adminHandler = require('../../handlers/adminHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('affiliate-info')
        .setDescription('Admin only: Get info on an affiliate! 🕵️')
        .addUserOption(opt => opt.setName('user').setDescription('The user to lookup').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const { affiliate, downloadsCount } = await adminHandler.getAffiliateStats(user.id);

        if (!affiliate) {
            return interaction.reply({ content: `No record found for user **${user.tag}**. 🆘`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🕵️ Affiliate Lookup: ${user.username}`)
            .setColor('#FF006E')
            .addFields(
                { name: 'Social Handle', value: `@${affiliate.social_handle} (${affiliate.platform})`, inline: true },
                { name: 'Verified', value: affiliate.verified ? '✅' : '❌', inline: true },
                { name: 'Joined', value: new Date(affiliate.joined_at).toLocaleDateString(), inline: true },
                { name: 'Asset Downloads', value: String(downloadsCount), inline: true },
                { name: 'Affiliate URL', value: affiliate.affiliate_link || 'Not set' }
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
