import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
    user: {
        id: number;
        username: string;
        password: string;
        panel_accessibility: string;
        general_accessibility: string;
    };
}

interface IJwtPayload extends JwtPayload {
    user: {
        id: number;
        username: string;
        password: string;
        panel_accessibility: string;
        general_accessibility: string;
    };
}


const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers["authorization"];
    const refreshToken = req.cookies["refreshToken"];
    console.log("accessToken: " + accessToken);
    console.log("refreshToken: " + refreshToken);

    if (!accessToken && !refreshToken) {
        console.log("Access Denied.");
        return res.status(401).send("Access Denied. No token provided.");
    }

    try {
        const decoded = jwt.verify(
            accessToken as string,
            process.env.JWT_SECRET as Secret,
        ) as IJwtPayload;
        (req as CustomRequest).user = decoded.user;
        next();
    } catch (error) {
        if (!refreshToken) {
            return res.status(401).send("Access Denied. No refresh token provided.");
        }

        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_SECRET_REFRESHER as Secret,
            )as IJwtPayload;
            const expiryTime = 1000 * 60 * 20; // 20 mins
            const accessToken = jwt.sign(
                { user: decoded.user },
                process.env.JWT_SECRET as Secret,
                {
                    expiresIn: expiryTime,
                },
            );

            (req as CustomRequest).user = decoded.user;
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
        } catch (error) {
            return res.status(400).send("Invalid Token.");
        }
    }
};

export default authenticate;
