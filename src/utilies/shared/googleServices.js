import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();
export const verifyGoogleToken = async ({ idToken, next } = {}) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload.email_verified) {
        return next(new Error("in valid email account", { cause: 401 }))

    }
    return payload
}

