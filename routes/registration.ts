import express from "express";
const router = express.Router();
import { getRegistrationSummaryList, registerSession, updatePatientAttendance } from "../controller/registrationController";

// list registration Summary for selected outlet by treatment date, timeslot
router.post("/list", getRegistrationSummaryList);

// register new session
router.post("/register", registerSession);

// update register attendance
router.put("/update", updatePatientAttendance);


export default router;


