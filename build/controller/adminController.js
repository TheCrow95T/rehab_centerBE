"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("running login api");
    const { username, password } = req.body;
    if (!username || !password) {
        const error = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }
    try {
        const client = new pg_1.Client();
        yield client.connect();
        const query = yield client.query("SELECT id,password FROM rehab_center.public.user_account WHERE username = $1::text", [username]);
        if (query.rows.length > 0 || query.rows[0].password) {
            const compare = yield bcrypt_1.default.compare(password, query.rows[0].password);
            const expiryTime = 1000 * 60 * 20; // 20 mins
            if (compare) {
                const user = {
                    id: query.rows[0].id,
                    username: username,
                    password: query.rows[0].password,
                };
                const accessToken = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
                    expiresIn: expiryTime,
                });
                const refreshToken = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET_REFRESHER, {
                    expiresIn: "1d",
                });
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
            }
            else {
                console.log("Password is wrong for user " + username);
                res.json({ message: "Wrong password" });
            }
        }
        else {
            res.json({ message: "database error" });
        }
        yield client.end();
    }
    catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
});
exports.login = login;
