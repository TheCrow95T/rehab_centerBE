import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload, VerifyErrors } from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

interface CustomRequest extends Request {
    token?: string; // Add token to request for potential downstream use
    user: {
        id: number;
        username: string;
        // password: string; // DO NOT INCLUDE PASSWORD IN JWT PAYLOAD
        panel_accessibility: string;
        general_accessibility: string;
    };
}

interface IJwtPayload extends JwtPayload {
    user: {
        id: number;
        username: string;
        // password: string; // DO NOT INCLUDE PASSWORD IN JWT PAYLOAD
        panel_accessibility: string;
        general_accessibility: string;
    };
}
const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_SECRET_REFRESHER = process.env.JWT_SECRET_REFRESHER as Secret;

if (!JWT_SECRET || !JWT_SECRET_REFRESHER) {
    console.error("FATAL ERROR: JWT secrets are not defined in environment variables.");
    // Depending on the application setup, you might want to exit the process
    // process.exit(1);
    // Or throw an error to be caught by a higher-level handler
    throw new Error("JWT secrets are not configured.");
}


const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const tokenFromCookie = req.cookies["accessToken"]; // Also check cookie if header is missing
    const accessToken = tokenFromHeader || tokenFromCookie;
    const refreshToken = req.cookies["refreshToken"];

    if (!accessToken && !refreshToken) {
        console.log("Access Denied.");
        return res.status(401).send("Access Denied. No token provided.");
    }

    // --- Verify Access Token ---
    if (accessToken) {
        try {
            const decoded = jwt.verify(
                accessToken,
                JWT_SECRET,
                { algorithms: ['HS256'] } // Specify algorithm
            ) as IJwtPayload;
            (req as CustomRequest).user = decoded.user;
            (req as CustomRequest).token = accessToken; // Attach token if needed later
            return next(); // Access token is valid, proceed
        } catch (err) {
            // Access token is invalid or expired, proceed to check refresh token
            console.warn("Access token verification failed:", (err as Error).message);
        }
    }

    // --- Access Token Failed or Missing - Verify Refresh Token ---
    if (!refreshToken) {
        console.log("Access Denied. No refresh token provided.");
        return res.status(401).send("Access Denied. No valid token provided.");
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            JWT_SECRET_REFRESHER,
            { algorithms: ['HS256'] } // Specify algorithm
        ) as IJwtPayload;

        // --- Issue New Access Token ---
        const expiryTime = 1000 * 60 * 20; // 20 mins - Consider making this configurable
        const newAccessToken = jwt.sign(
            { user: decoded.user },
            JWT_SECRET,
            {
                expiresIn: expiryTime / 1000, // jwt expects seconds
            },
        );

        (req as CustomRequest).user = decoded.user;
        (req as CustomRequest).token = newAccessToken; // Attach new token

        // Set cookies for new access token and existing refresh token
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 1000 * 60 * 60 * 24, // Example: 1 day
            sameSite: "strict",
        });
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true, // Make access token cookie HttpOnly
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: expiryTime, // Match access token expiry
            sameSite: "strict",
        });

        console.log("Refreshed access token for user:", decoded.user.username);
        next(); // Proceed with the request using the refreshed token/user info

    } catch (error) {
        // Refresh token is invalid
        console.error("Refresh token verification failed:", (error as Error).message);
        // Clear potentially invalid cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(401).send("Authentication failed. Invalid refresh token.");
    }
};

export default authenticate;
