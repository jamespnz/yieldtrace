import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/**
 * STRATEGIC NOTE: In a Vanilla JS environment without a bundler (like Vite/Webpack),
 * we cannot use process.env. You have two choices:
 * 1. Hardcode the strings here (since it's the 'anon' key, it is safe).
 * 2. Fetch them from a /config endpoint on your server (more professional).
 */

// Option 1: Hardcode for speed (Immediate sprint completion)
const SUPABASE_URL = 'https://rldsnwbqyqruidqvnjtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZHNud2JxeXFydWlkcXZuanRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDg3NTQsImV4cCI6MjA4NDg4NDc1NH0.AMgSbdIMQ7_AG51XfB5OcuGV7c-rjD8BfLxya9W3Wzw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches the project details to populate the UI Header.
 */
export async function getProjectData() {
    const { data, error } = await supabase
        .from('solar_projects')
        .select('*')
        .limit(1)
        .single();
    
    if (error) {
        console.error("❌ UI Fetch Error:", error.message);
        return null;
    }
    return data;
}