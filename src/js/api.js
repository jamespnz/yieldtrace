import { renderTraceStep } from './main.js';

/**
 * Communicates with the Node.js backend to run Gemini 1.5 Pro analysis.
 * Implements the "End-to-End Tracing" principle.
 */
export async function runAnalystSession(sessionId, projectData) {
    try {
        // Trace Step: Initiating Network Request
        renderTraceStep('NETWORK', 'Dispatching payload to Gemini 1.5 Pro analyst...');

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId,
                metadata: projectData.metadata,
                metrics: projectData.metrics
            }),
        });

        if (!response.ok) {
            throw new Error(`Terminal Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Trace Step: Data science insights received
        renderTraceStep('SUCCESS', 'Financial reasoning payload ingested.');

        // If the agent provided specific reasoning steps in the JSON, log them
        if (data.reasoning_trace && Array.isArray(data.reasoning_trace)) {
            data.reasoning_trace.forEach(step => {
                renderTraceStep('AGENT', step);
            });
        }

        return data;

    } catch (error) {
        renderTraceStep('ERROR', `Pipeline failed: ${error.message}`, 'error');
        throw error;
    }
}