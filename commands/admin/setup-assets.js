const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-assets')
        .setDescription('Post the get assets button in this channel. (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('📥 Get Promotional Assets')
            .setDescription('Need high-quality images and videos to promote your Eromify links and go viral?\n\nClick the button below to receive the exclusive Affiliate Assets Folder directly in your DMs! 🍑✨')
            .setFooter({ text: 'Eromify Affiliate Program' });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('get_assets_link')
                .setLabel('Get Assets Link')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📂')
        );

        await interaction.channel.send({ embeds: [embed], components: [buttons] });
        await interaction.reply({ content: 'Assets portal has been set up successfully!', ephemeral: true });
    },
};
