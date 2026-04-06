const { SlashCommandBuilder } = require('discord.js');
const vHandler = require('../handlers/verificationHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Start your Eromify affiliate verification!')
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('Platform to verify (TikTok/Instagram/YouTube)')
                .setRequired(true)
                .addChoices(
                    { name: 'TikTok', value: 'tiktok' },
                    { name: 'Instagram', value: 'instagram' },
                    { name: 'YouTube', value: 'youtube' }
                ))
        .addStringOption(option =>
            option.setName('handle')
                .setDescription('Your social media handle (e.g., @myhandle)')
                .setRequired(true)),
                
    async execute(interaction) {
        const platform = interaction.options.getString('platform');
        const handle = interaction.options.getString('handle').replace('@', '');
        
        await interaction.reply({ 
            content: `Verification started for **${platform}** handle **@${handle}**... 🍑✨ Check your DMs for your unique code!`, 
            ephemeral: true 
        });

        // Trigger the logic in the handler
        await vHandler.startVerification(interaction, platform, handle);
    },
};
