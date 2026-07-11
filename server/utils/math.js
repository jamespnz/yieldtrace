/**
 * Financial utilities for Solar Asset Analysis.
 * These functions ground the Agentic AI in deterministic math.
 */

const calculateROI = (totalRevenue, installationCost) => {
    if (installationCost === 0) return 0;
    return ((totalRevenue / installationCost) * 100).toFixed(2);
};

const calculatePaybackPeriod = (installationCost, averageMonthlyRevenue) => {
    if (averageMonthlyRevenue === 0) return Infinity;
    return (installationCost / averageMonthlyRevenue / 12).toFixed(2);
};

const calculatePerformanceVariance = (actual, projected) => {
    if (projected === 0) return 0;
    return (((actual - projected) / projected) * 100).toFixed(2);
};

/**
 * Aggregates raw metrics into a summary object for the Gemini Prompt.
 */
const summarizeMetrics = (metrics, installationCost, ppaRate = 0.15) => {
    const totalActualKwh = metrics.reduce((sum, m) => sum + m.actual_kwh, 0);
    const totalProjectedKwh = metrics.reduce((sum, m) => sum + m.projected_kwh, 0);
    const totalRevenue = totalActualKwh * ppaRate;
    
    // Calculate average monthly revenue based on the data span provided
    const daysSpan = metrics.length;
    const dailyAvg = totalRevenue / daysSpan;
    const monthlyAvg = dailyAvg * 30.44;

    return {
        totalActualKwh,
        totalRevenue,
        roiToDate: calculateROI(totalRevenue, installationCost),
        varianceIndex: calculatePerformanceVariance(totalActualKwh, totalProjectedKwh),
        projectedPaybackYears: calculatePaybackPeriod(installationCost, monthlyAvg)
    };
};

module.exports = {
    summarizeMetrics,
    calculateROI,
    calculatePerformanceVariance
};