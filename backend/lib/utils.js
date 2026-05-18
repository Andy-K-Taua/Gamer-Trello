// backend/lib/utils.js

import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //MS
        httpOnly: true, //prevent XSS attacks cross-site scripting attacks
        sameSite: "lax", // Change from "strict" to "lax" for proxy support
        secure: false,   // FORCE false for local HTTP development so Safari accepts it
    });

    return token;
}