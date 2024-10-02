import express from "express";
const router = express.Router();
import { createNewPatient, getPatientList, getRegistrationByPatient, updatePatientDetails } from "../controller/patientController";

// list patients details by page
router.get("/list", getPatientList);

// list patient register by page
router.post("/list/register", getRegistrationByPatient);

// create new patient
router.post("/create", createNewPatient);

// update patient details
router.put("/update", updatePatientDetails);


export default router;

