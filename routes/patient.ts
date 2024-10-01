import express from "express";
const router = express.Router();
import { createNewPatient, getPatientList, updatePatientDetails } from "../controller/patientController";

// list patients details by list
router.get("/list", getPatientList);

// create new patient
router.post("/create", createNewPatient);

// update patient details
router.put("/update", updatePatientDetails);


export default router;

