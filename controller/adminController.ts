import { NextFunction, Request, Response } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Client } from "pg";

interface ErrorWithStatus extends Error {
    status?: number;
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { username, password } = req.body;

    if (!username || !password) {
        const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }

    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DBNAME,
    });
    await client.connect();

    try {
        const res = await client.query(
            "SELECT password FROM user_account WHERE username = $1::text",
            [username],
        );
        console.log(res.rows[0].password); // Hello world!
        await client.end();
    } catch (e) {
        console.log(e);
        await client.end();
        res.json({ message: "database error" });
    }
};
