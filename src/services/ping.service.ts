export const ping = () => {
    console.log("Ping request received at:", new Date().toISOString());
    return {
        data: { pong: true },
        message: "Server is responsive",
        success: true,
    };
};
