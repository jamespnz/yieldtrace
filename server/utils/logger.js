const { createClient } = require('@supabase/supabase-js');

// Initialize a dedicated Supabase client for backend logging
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/**
 * logTrace: The core observability utility for SolAnalytica.
 * Directly addresses the 'Actual AI Engineering' gap of observability.
 */
async function logTrace(sessionId, step, data = {}) {
    const { 
        inputPayload = null, 
        retrievedContext = null, 
        outputResponse = null, 
        latency = 0, 
        model = "gemini-1.5-pro" 
    } = data;

    console.log(`[TRACE][${step.toUpperCase()}]: Session ${sessionId}`);

    const { error } = await supabase
        .from('trace_logs')
        .insert([{
            session_id: sessionId,
            trace_step: step, // 'input', 'retrieval', 'reasoning', 'output'
            model_version: model,
            input_payload: inputPayload,
            retrieved_context: retrievedContext,
            output_response: outputResponse,
            latency_ms: latency,
            created_at: new Date().toISOString()
        }]);

    if (error) {
        console.error(`❌ [TRACE_LOG_ERROR]:`, error.message);
        return false;
    }
    
    return true;
}

module.exports = { logTrace };