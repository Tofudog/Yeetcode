import { hash, verify } from 'argon2';

const KEY = process.env.BCRYPT_KEY;

export const hashPassword = async (password) => {
    // Convert password to string to handle numbers
    const passwordString = String(password);
    return await hash(passwordString, 10, { key: KEY });
}

export const comparePassword = async (password, hash) => {
    try {
        // Convert password to string to handle numbers
        const passwordString = String(password);
        return await verify(hash, passwordString, { key: KEY });
    } catch(err) {
        console.error("Password comparison error:", err);
        return false;
    }
}