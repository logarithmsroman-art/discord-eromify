const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-verification')
        .setDescription('Post the verification portal in this channel. (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🍑✨ Eromify Affiliate Verification')
            .setDescription(
                'Welcome to the Eromify Affiliate Program! To grant you access to the private affiliate channels and assets, we need to verify your social media profile.\n\n' +
                '### **Instructions:**\n' +
                '1.  Click the **"Verify"** button below to start.\n' +
                '2.  Select your platform and enter your handle in the popup.\n' +
                '3.  Add the **unique code** provided by the bot to your bio.\n' +
                '4.  Click the **"Complete Verification"** button you will receive privately!\n\n' +
                '*Verification is automated and usually takes less than 30 seconds.*'
            )
            .setColor('#FF006E')
            .setThumbnail(interaction.client.user.displayAvatarURL());

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('start_verify')
                    .setLabel('Verify')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🤳')
            );

        await interaction.reply({ content: 'Verification portal deployed! 🍑✨', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [buttons] });
    },
};



