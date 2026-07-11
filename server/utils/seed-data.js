const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function seedSolarData() {
    console.log("🌱 Starting Seeding Process...");

    // 1. Create the Project Asset
    const { data: project, error: pError } = await supabase
        .from('solar_projects')
        .insert([{
            name: "Kyushu Solar Array Alpha",
            capacity_mw: 5.5,
            installation_cost: 1200000.00
        }])
        .select()
        .single();

    if (pError) {
        console.error("❌ Error creating project:", pError.message);
        return;
    }

    console.log(`✅ Project Created: ${project.name} (${project.id})`);

    // 2. Generate 365 days of Metrics
    const metrics = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Start 1 year ago

    for (let i = 0; i < 365; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Seasonal Logic: Peak in July (Month 6), Low in Jan (Month 0)
        const month = currentDate.getMonth();
        const seasonalFactor = 1 + 0.4 * Math.sin((month - 3) * Math.PI / 6);
        
        const projected = 2500 * seasonalFactor;
        const randomness = 0.85 + Math.random() * 0.3; // 85% to 115% variance
        const actual = projected * randomness;

        metrics.push({
            project_id: project.id,
            projected_kwh: Math.round(projected),
            actual_kwh: Math.round(actual),
            reading_date: currentDate.toISOString().split('T')[0]
        });
    }

    // 3. Batch Insert to Supabase
    const { error: mError } = await supabase.from('generation_metrics').insert(metrics);

    if (mError) {
        console.error("❌ Error seeding metrics:", mError.message);
    } else {
        console.log("✅ 365 days of metrics seeded successfully.");
    }
}

seedSolarData();