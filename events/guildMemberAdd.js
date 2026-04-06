module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Updated channel IDs
        const generalChatId = '1490369104039641178';
        const getStartedChannelId = '1490706140139618435';
        const verifyChannelId = '1490652977768304741';

        const welcomeChannel = member.guild.channels.cache.get(generalChatId)
            || member.guild.channels.cache.find(ch => ch.name.includes('general'));

        if (welcomeChannel) {
            welcomeChannel.send(
                `👋 Welcome to the **Eromify Affiliate Program**, ${member}! 🍑✨\n\n` +
                `➡️ Head to <#${getStartedChannelId}> to learn how everything works.\n` +
                `✅ Then go to <#${verifyChannelId}> to verify yourself and unlock the private affiliate channels!`
            );
        }
    },
};
