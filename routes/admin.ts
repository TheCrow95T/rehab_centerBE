import express from "express";
import {
    login
} from "../controller/adminController";
const router = express.Router();

// login -- not use
router.post("/user/login", login);

export default router;
