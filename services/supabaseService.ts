import { createClient } from '@supabase/supabase-js';
import { GeneratorInputs } from '../types.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jzwohodbfcwtoltsstfs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_F4kb9oHazzs2zyk5kLL0FA_zxckXSIB';

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});

/**
 * Persists lead data to Supabase silently.
 */
export const saveLeadToSupabase = async (inputs: GeneratorInputs) => {
    console.log("Supabase saveLead triggered. URL present:", !!supabaseUrl, "Key present:", !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase lead capture skipped: Credentials not set.");
        return;
    }

    try {
        const { error } = await supabase
            .from('leads')
            .insert([
                {
                    company_name: inputs.companyName,
                    phone: inputs.phone,
                    industry: inputs.industry,
                    location: inputs.location,
                    raw_data: inputs
                }
            ]);

        if (error) {
            console.error("Supabase insert error details:", error);
            throw error;
        }
        console.log("Lead saved to Supabase successfully.");
    } catch (error) {
        console.error("Failed to save lead to Supabase:", error);
    }
};
