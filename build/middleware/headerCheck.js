"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const headerCheck = (req, res, next) => {
    if (req.headers["api-key"] !== process.env.API_KEY) {
        return res.status(403).json({ msg: "Insufficient header sent" });
    }
    next();
};
exports.default = headerCheck;
