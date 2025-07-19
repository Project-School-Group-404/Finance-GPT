import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database.js';
import { config } from './config.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists with the same email
                let user = await prisma.user.findUnique({
                    where: { email: profile.emails[0].value }
                });

                if (user) {
                    // User exists, update provider to google if it was local
                    if (user.provider === 'local') {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                provider: 'google'
                            }
                        });
                    }
                    return done(null, user);
                }

                // Create new user
                user = await prisma.user.create({
                    data: {
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        provider: 'google'
                    }
                });

                return done(null, user);
            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
