const { supabase } = require('../utils/supabase');

module.exports = {
    async logAction(actionType, performedBy, targetUser, reason) {
        return await supabase.from('admin_actions').insert([{
            action_type: actionType,
            performed_by: performedBy,
            target_user: targetUser,
            reason: reason
        }]);
    },
    async getAffiliateStats(discordId) {
        const { data: affiliate } = await supabase.from('affiliates').select('*').eq('discord_id', discordId).single();
        const { count: downloads } = await supabase.from('asset_downloads').select('*', { count: 'exact', head: true }).eq('discord_id', discordId);
        return { affiliate, downloadsCount: downloads || 0 };
    }
};
