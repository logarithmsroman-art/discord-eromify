const logger = require('../utils/logger');
const vHandler = require('../handlers/verificationHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // 1. Handle Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(`Error executing command ${interaction.commandName}:`, error);
                const reply = { content: 'There was an error while executing this command!', ephemeral: true };
                interaction.replied || interaction.deferred ? await interaction.followUp(reply) : await interaction.reply(reply);
            }
        } 
        
        // 2. Handle Button Clicks
        else if (interaction.isButton()) {
            if (interaction.customId === 'start_verify') {
                await vHandler.showPlatformDropdown(interaction);
            } else if (interaction.customId === 'complete_verify') {
                await vHandler.completeVerification(interaction);
            } else if (interaction.customId === 'get_assets_link') {
                try {
                    await interaction.user.send('### 📂 Your Eromify Promotional Assets\n\nHere is the link to our exclusive drive containing all the high-quality images and videos you need to go viral:\n\n🔗 **[Insert Your Link Here]**(https://your-link.com)\n\n*Pro-tip: Download the content and mix it with trending sounds for maximum impressions!* 🍑✨');
                    await interaction.reply({ content: 'I just sent the asset links to your DMs! 📥', ephemeral: true });
                } catch (error) {
                    await interaction.reply({ content: 'I tried to DM you the link, but your DMs are closed! Please enable DMs from server members and try again.', ephemeral: true });
                }
            }
        }


        // 3. Handle Select Menu (Dropdown)
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'select_platform') {
                const platform = interaction.values[0];
                await vHandler.showHandleModal(interaction, platform);
            }
        }

        // 4. Handle Modal (Form) Submissions
        else if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('verify_modal_')) {
                const platform = interaction.customId.split('_')[2];
                await vHandler.handleVerifySubmission(interaction, platform);
            }
        }
    },
};


