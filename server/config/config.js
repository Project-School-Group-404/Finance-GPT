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
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
    },
    session: {
        secret: process.env.SESSION_SECRET || "your-session-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }
};
