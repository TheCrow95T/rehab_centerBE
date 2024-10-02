import express from "express";
const router = express.Router();
import { createNewPatient} from "../controller/patientController";
import { getRegistrationSummaryList, updatePatientAttendance } from "../controller/registrationController";

// list patients details by list
router.get("/list", getRegistrationSummaryList);

// register new session
router.post("/create", createNewPatient);

// update register attendance
router.put("/update", updatePatientAttendance);


export default router;


