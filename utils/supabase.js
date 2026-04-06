const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL or SUPABASE_KEY missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
    supabase,
    // Add helper functions as needed
    async getAffiliate(discordId) {
        const { data, error } = await supabase
            .from('affiliates')
            .select('*')
            .eq('discord_id', discordId)
            .single();
        return { data, error };
    },
    async createVerificationAttempt(discordId, platform, handle, code) {
        const { data, error } = await supabase
            .from('verification_attempts')
            .insert([{
                discord_id: discordId,
                platform,
                handle,
                code_generated: code,
                status: 'pending',
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString() // 2 hour expiry
            }]);
        return { data, error };
    }
};
