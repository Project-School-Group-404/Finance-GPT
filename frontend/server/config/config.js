export const config = {
    port: process.env.PORT || 3000,
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true
    },
    jwt: {
        secret: process.env.JWT_SECRET || "your-secret-key",
        expiresIn: "24h"
    },
    bcrypt: {
        saltRounds: 10
    },
    chat: {
        maxHistoryPerUser: 10
    }
};
