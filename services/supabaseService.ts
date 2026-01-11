import { createClient } from '@supabase/supabase-js';
import { GeneratorInputs } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://jzwohodbfcwtoltsstfs.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_F4kb9oHazzs2zyk5kLL0FA_zxckXSIB';

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Persists lead data to Supabase silently.
 */
export const saveLeadToSupabase = async (inputs: GeneratorInputs) => {
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

        if (error) throw error;
        console.log("Lead saved to Supabase silently.");
    } catch (error) {
        console.error("Failed to save lead to Supabase:", error);
    }
};
