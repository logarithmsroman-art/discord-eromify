const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { supabase } = require('../utils/supabase');
const scraper = require('../utils/scraper');
const logger = require('../utils/logger');

// CONFIG: Set your role IDs here
const VERIFIED_ROLE_ID = '1490665099701256335'; // Replace with the ID you copied

module.exports = {
    // Stage 1: User clicked "Verify" -> Show private dropdown
    async showPlatformDropdown(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_platform')
            .setPlaceholder('🚀 Choose your platform...')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('TikTok').setValue('tiktok').setEmoji('🤳'),
                new StringSelectMenuOptionBuilder().setLabel('Instagram').setValue('instagram').setEmoji('🍑'),
                new StringSelectMenuOptionBuilder().setLabel('YouTube').setValue('youtube').setEmoji('🎥')
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: '### 🍑✨ Welcome! \nTo begin, please **select the platform** you want to verify:',
            components: [row],
            ephemeral: true
        });
    },

    // Stage 2: User picked platform -> Show Handle Modal
    async showHandleModal(interaction, platform) {
        const modal = new ModalBuilder()
            .setCustomId(`verify_modal_${platform}`)
            .setTitle(`🍑 ${platform.toUpperCase()} Verification`);

        const handleInput = new TextInputBuilder()
            .setCustomId('handle')
            .setLabel(`Your ${platform} Username (without @)`)
            .setPlaceholder('e.g., my_username')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(handleInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    },

    // Stage 2: User submitted the handle (Save attempt, show ephemeral code + COMPLETE button)
    async handleVerifySubmission(interaction, platform) {
        await interaction.deferReply({ ephemeral: true });

        const handle = interaction.fields.getTextInputValue('handle').replace('@', '');
        const discordId = interaction.user.id;
        const discordUsername = interaction.user.username;
        
        // Generate code
        const code = `EF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        try {
            await Promise.all([
                supabase.from('affiliates').upsert({
                    discord_id: discordId,
                    discord_username: discordUsername,
                    platform,
                    social_handle: handle,
                    verified: false
                }),
                supabase.from('verification_attempts').insert({
                    discord_id: discordId,
                    code_generated: code,
                    platform,
                    handle,
                    status: 'pending'
                })
            ]);

            // Create the "Complete Verification" button for this specific user
            const completeButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('complete_verify')
                        .setLabel('Complete Verification')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅')
                );

            await interaction.editReply({
                content: `### 🍑✨ Almost there!\n\n1.  Add this code to your **${platform}** bio: \n**\`${code}\`**\n2.  Wait 15-30 seconds for the platform to refresh.\n3.  Click the **"Complete Verification"** button below!\n\n*(This message is private)*`,
                components: [completeButton]
            });
        } catch (error) {
            logger.error('Error handling verify modal submission:', error);
            await interaction.editReply({ content: 'Error saving your verification! 🆘 Please try again.' });
        }
    },


    // Stage 3: User clicked "Complete Verification" (Check bio)
    async completeVerification(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const discordId = interaction.user.id;

        try {
            const { data: attempt, error: aError } = await supabase
                .from('verification_attempts')
                .select('*')
                .eq('discord_id', discordId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (aError || !attempt) {
                return interaction.editReply('No pending verification found! 🆘 Please pick a platform from the dropdown first.');
            }

            const result = await scraper.verifyBio(attempt.platform, attempt.handle, attempt.code_generated);

            if (result.success) {
                // Update Database
                await Promise.all([
                    supabase.from('affiliates').update({ verified: true }).eq('discord_id', discordId),
                    supabase.from('verification_attempts').update({ status: 'success' }).eq('id', attempt.id)
                ]);

                // 🍑✨ ADD THE ROLE AUTOMATICALLY!
                try {
                    const member = await interaction.guild.members.fetch(discordId);
                    if (member && VERIFIED_ROLE_ID !== 'YOUR_ROLE_ID_HERE') {
                        await member.roles.add(VERIFIED_ROLE_ID);
                        logger.info(`Assigned verified role to ${member.user.tag}`);
                    }
                } catch (rErr) {
                    logger.error(`Error assigning role:`, rErr);
                }

                await interaction.editReply('### 🍑✨ Verified!\n\nYou have been **SUCCESSFULLY VERIFIED** as an official Eromify Affiliate! Your roles have been updated—check out the private channels to start posting. 🚀');
            } else {
                await interaction.editReply(`❌ Bio Check Failed: **${result.message}**\n\nEnsure \`${attempt.code_generated}\` is in your bio and try clicking **Complete** again in a moment!`);
            }
        } catch (error) {
            logger.error('Error completing verification:', error);
            await interaction.editReply('Something went wrong! 🆘 Please try again later.');
        }
    }
};



