const gemini = require('../utils/gemini');
const logger = require('../utils/logger');

// Global knowledge about the Eromify Affiliate Program
const GLOBAL_KNOWLEDGE = `
You are the Eromify AI Assistant. Your goal is to help affiliates succeed in our program. 
You must ONLY use the exact channel IDs below to direct people. NEVER make up a channel ID.

### ABOUT EROMIFY:
Eromify is an AI content platform. It uses artificial intelligence to generate and distribute content. Affiliates earn commissions by promoting Eromify and driving sign-ups/subscriptions through their unique referral links. This is NOT adult content — it is AI-generated content technology.

### SERVER CHANNELS:
**Start Here Category (Public)**
- **FAQ**: <#1490706292996837478> (Common questions)
- **Verify**: <#1490652977768304741> (Where to get verified)
- **Get Started**: <#1490706140139618435> (Instructions for new members)
- **About the Program**: <#1490757178448019647> (What Eromify is, payouts, commissions)
- **Posting Guide**: <#1490757324233642125> (Tips for going viral and getting traffic)
- **General Chat**: <#1490369104039641178> (Chat with others)
- **Assets**: <#1490746747624886312> (Check for promo assets and drives)

**Affiliate Hub (Private - Verified Only, ensure you tell them to verify first if they want access)**
- **Affiliate Chat**: <#1490708108027363468> (Verified affiliates chat)
- **Partnership**: <#1490708160791445615> (For serious brand questions)
- **Help Desk**: <#1490708223118803014> (Technical assistance and ticket creation)
- **Payments**: <#1490712886249787442> (Payout rules and stats)

### PROGRAM DETAILS:
- **Verification**: New users MUST go to <#1490652977768304741> to verify their identity/accounts before accessing the Affiliate Hub.
- **Promotional Materials**: Click the button in <#1490746747624886312> to get your assets via DM.
`;

const INTERVENTION_RULE = `
CRITICAL INSTRUCTION FOR INTERVENING:
You are in a live public discord channel where human users are talking to each other. 
If the user's message is just conversational, greeting others, chatting with another human, or a very brief statement NOT requiring support, YOU MUST RESPOND WITH EXACTLY THE WORD: [IGNORE].
ONLY respond normally if the user is explicitly asking a question about the program, payout, verification, assets, policies, or clearly needs help.
If in doubt, reply with [IGNORE] so you don't spam the chat.
`;

const CHANNEL_CONFIG = {
    'general': `${GLOBAL_KNOWLEDGE}\n${INTERVENTION_RULE}\nYou are actively stationed in General Chat. Be friendly and direct. If it's a question you can answer, answer it briefly.`,
    'help-desk': `${GLOBAL_KNOWLEDGE}\n${INTERVENTION_RULE}\nYou are stationed in the Help Desk. Focus on resolving affiliate issues. Direct them to FAQ <#1490706292996837478> or suggest they open a ticket if it requires a human.`
};

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Find the matching configuration based on channel name
        const channelName = message.channel.name.toLowerCase();
        
        // We only want the AI to be active in general chat and help desk.
        let matchedChannel = null;
        if (channelName.includes('general')) matchedChannel = 'general';
        else if (channelName.includes('help-desk')) matchedChannel = 'help-desk';
        
        // If the channel is not general or help desk, do nothing.
        if (!matchedChannel) return;

        // Ignore very short messages (likely not questions) unless it's a clear trigger
        if (message.content.split(' ').length < 3 && !message.content.includes('?')) return;

        try {
            const systemPrompt = CHANNEL_CONFIG[matchedChannel];

            // Generate response using Gemini
            const reply = await gemini.generateResponse(message.content, systemPrompt);
            
            // If the AI decides it's just human chatter, it outputs [IGNORE]
            if (reply && reply.trim() !== '[IGNORE]') {
                // Remove [IGNORE] just in case it included it inside a real message
                const cleanReply = reply.replace(/\[IGNORE\]/g, '').trim();
                
                if (cleanReply.length > 0) {
                    // Start typing indicator, then send message
                    await message.channel.sendTyping();
                    await message.reply(cleanReply);
                }
            }
        } catch (err) {
            logger.error('Error generating AI response:', err);
        }
    },
};

