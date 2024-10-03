import express from "express";
const router = express.Router();
import { createNewPatient, getPatientDetails, getPatientList, getRegistrationByPatient, updatePatientDetails } from "../controller/patientController";

// list patients details by page
router.get("/list", getPatientList);

// get patient details by identification card
router.post("/details", getPatientDetails);

// list patient register by page
router.post("/list/register", getRegistrationByPatient);

// create new patient
router.post("/create", createNewPatient);

// update patient details
router.put("/update", updatePatientDetails);


export default router;

