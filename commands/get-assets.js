const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { supabase } = require('../utils/supabase');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-assets')
        .setDescription('Get your Eromify affiliate assets (videos/captions)! 🍑✨'),
        
    async execute(interaction) {
        const { data: assets, error } = await supabase
            .from('assets')
            .select('*')
            .limit(5); // Show latest 5 assets

        if (error || !assets || assets.length === 0) {
            return interaction.reply({ content: 'No assets available yet! Check back soon or contact #support. 🆘', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('🍑 Premium Affiliate Assets')
            .setDescription('Download these high-converting assets and start posting!')
            .setColor('#FF006E')
            .setTimestamp();

        assets.forEach(asset => {
            embed.addFields({ 
                name: `📁 ${asset.name}`, 
                value: `**Instructions**: ${asset.instructions}\n**Caption**: ${asset.caption}\n[Download Now](${asset.drive_link})` 
            });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
