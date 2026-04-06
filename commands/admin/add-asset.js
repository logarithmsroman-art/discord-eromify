const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { supabase } = require('../../utils/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-asset')
        .setDescription('Admin only: Add a new affiliate asset! 🍑')
        .addStringOption(opt => opt.setName('name').setDescription('Asset Name').setRequired(true))
        .addStringOption(opt => opt.setName('drive_link').setDescription('Google Drive Link').setRequired(true))
        .addStringOption(opt => opt.setName('caption').setDescription('Proposed Caption').setRequired(true))
        .addStringOption(opt => opt.setName('instructions').setDescription('Any specific instructions').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const drive_link = interaction.options.getString('drive_link');
        const caption = interaction.options.getString('caption');
        const instructions = interaction.options.getString('instructions');

        const { error } = await supabase.from('assets').insert([{
            name, drive_link, caption, instructions,
            added_by: interaction.user.username
        }]);

        if (error) {
            return interaction.reply({ content: `Error adding asset: ${error.message}`, ephemeral: true });
        }

        await interaction.reply({ content: `Successfully added asset: **${name}**! 🍑✨`, ephemeral: true });
    },
};
