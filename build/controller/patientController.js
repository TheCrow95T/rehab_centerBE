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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientDetails = exports.createNewPatient = exports.getPatientList = void 0;
const pg_1 = require("pg");
const getPatientList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page } = req.query;
    if (typeof page !== "string") {
        const error = new Error(`Invalid query submitted`);
        error.status = 400;
        return next(error);
    }
    const pagePG = parseInt(page) > 1 ? (parseInt(page) - 1) * 50 : 0;
    try {
        const client = new pg_1.Client();
        yield client.connect();
        const query = yield client.query("SELECT identification_number, fullname, date_of_birth, gender, phone_number, home_address, email, recover FROM rehab_center.public.customer  OFFSET $1 LIMIT 50", [pagePG]);
        res.json({ message: "database success", patienceArray: query.rows });
        yield client.end();
    }
    catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
});
exports.getPatientList = getPatientList;
const createNewPatient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { identification_number, fullname, date_of_birth, gender, phone_number, home_address, email, } = req.body;
    if (!identification_number ||
        !fullname ||
        !date_of_birth ||
        !gender ||
        !phone_number ||
        !home_address.street ||
        !home_address.city ||
        !home_address.state ||
        !home_address.postcode ||
        !home_address.country ||
        !email) {
        const error = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }
    try {
        const client = new pg_1.Client();
        yield client.connect();
        const query = yield client.query("INSERT INTO rehab_center.public.customer (identification_number,fullname,date_of_birth,gender,phone_number,home_address,email) VALUES($1,$2,$3,$4,$5,($6,$7,$8,$9,$10),$11) RETURNING *", [
            identification_number,
            fullname,
            date_of_birth,
            gender,
            phone_number,
            home_address.street,
            home_address.city,
            home_address.state,
            home_address.postcode,
            home_address.country,
            email,
        ]);
        if (query.rows.length > 0) {
            res.json({ message: "Patient create success", result: query.rows[0] });
        }
        else {
            res.json({ message: "Patient create failed", result: [] });
        }
        yield client.end();
    }
    catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
});
exports.createNewPatient = createNewPatient;
const updatePatientDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { identification_number, phone_number, home_address, email, recovery } = req.body;
    if (!identification_number ||
        !phone_number ||
        !home_address.street ||
        !home_address.city ||
        !home_address.state ||
        !home_address.postcode ||
        !home_address.country ||
        !email ||
        !recovery) {
        const error = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }
    try {
        const client = new pg_1.Client();
        yield client.connect();
        const query = yield client.query("UPDATE rehab_center.public.customer SET phone_number=$1,home_address=($2,$3,$4,$5,$6),email = $7,recover= $8 WHERE identification_number=$9 RETURNING *", [
            phone_number,
            home_address.street,
            home_address.city,
            home_address.state,
            home_address.postcode,
            home_address.country,
            email,
            recovery,
            identification_number,
        ]);
        if (query.rows.length > 0) {
            res.json({ message: "Patient create success", result: query.rows[0] });
        }
        else {
            res.json({ message: "Patient create failed", result: [] });
        }
        yield client.end();
    }
    catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
});
exports.updatePatientDetails = updatePatientDetails;
