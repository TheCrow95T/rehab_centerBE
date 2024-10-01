"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const accessToken = req.headers["authorization"];
    const refreshToken = req.cookies["refreshToken"];
    if (!accessToken && !refreshToken) {
        console.log("Access Denied.");
        return res.status(401).send("Access Denied. No token provided.");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    }
    catch (error) {
        if (!refreshToken) {
            return res.status(401).send("Access Denied. No refresh token provided.");
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET_REFRESHER);
            const expiryTime = 1000 * 60 * 20; // 20 mins
            const accessToken = jsonwebtoken_1.default.sign({ user: decoded.user }, process.env.JWT_SECRET, {
                expiresIn: expiryTime,
            });
            req.user = decoded.user;
            res
                .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: "strict",
            })
                .cookie("accessToken", accessToken, {
                maxAge: expiryTime * 1.5,
                sameSite: "strict",
            });
            next();
        }
        catch (error) {
            return res.status(400).send("Invalid Token.");
        }
    }
};
exports.default = authenticate;
