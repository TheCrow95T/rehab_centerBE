import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { Client } from "pg";
import bcrypt from "bcrypt";

interface ErrorWithStatus extends Error {
    status?: number;
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log("running login api");
    const { username, password } = req.body;

    if (!username || !password) {
        const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }

    try {
        const client = new Client();
        await client.connect();

        const query = await client.query(
            "SELECT id,password FROM rehab_center.public.user_account WHERE username = $1::text",
            [username],
        );
        if (query.rows.length > 0 || query.rows[0].password) {
            const compare = await bcrypt.compare(password, query.rows[0].password);

            const expiryTime = 1000 * 60 * 20; // 20 mins

            if (compare) {
                const user = {
                    id: query.rows[0].id,
                    username: username,
                    password: query.rows[0].password,
                };
                const accessToken = jwt.sign(
                    { user },
                    process.env.JWT_SECRET as Secret,
                    {
                        expiresIn: expiryTime,
                    },
                );
                const refreshToken = jwt.sign(
                    { user },
                    process.env.JWT_SECRET_REFRESHER as Secret,
                    {
                        expiresIn: "1d",
                    },
                );

                res
                    .cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24,
                        sameSite: "strict",
                    })
                    .cookie("accessToken", accessToken, {
                        maxAge: expiryTime * 1.5,
                        sameSite: "strict",
                    })
                    .json({ message: "Login success!" });
            } else {
                console.log("Password is wrong for user " + username);
                res.json({ message: "Wrong password" });
            }
        } else {
            res.json({ message: "database error" });
        }
        await client.end();
    } catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
};
