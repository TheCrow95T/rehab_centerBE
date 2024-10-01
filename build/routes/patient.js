"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const patientController_1 = require("../controller/patientController");
// list patients details by list
router.get("/list", patientController_1.getPatientList);
// create new patient
router.post("/create", patientController_1.createNewPatient);
// update patient details
router.put("/update", patientController_1.updatePatientDetails);
exports.default = router;
