export const health = () => {
    try {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const timestamp = new Date().toISOString();

        const healthData = {
            status: "healthy",
            timestamp,
            uptime: Math.floor(uptime),
            version: "1.0.0",
            environment: process.env["NODE_ENV"] || "development",
            memory: {
                used: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
                total: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
                external: (memoryUsage.external / 1024 / 1024).toFixed(2),
                rss: (memoryUsage.rss / 1024 / 1024).toFixed(2),
            },
        };
        console.log("Health check data:", healthData);
        return {
            data: healthData,
            message: "Server is healthy and running",
            success: true,
        };
    } catch (error) {
        return {
            data: null,
            message: "Service unavailable",
            success: false,
        };
    }
};
