import { NextFunction, Request, Response } from "express";
import { Client } from "pg";

interface ErrorWithStatus extends Error {
    status?: number;
}

export const getRegistrationSummaryList = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { outlet_id, start_date, end_date } = req.body;

    if (!outlet_id || !start_date || !end_date) {
        const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }

    try {
        const client = new Client();
        await client.connect();

        const queryString = [
            "SELECT to_char(treatment_date,'YYYY-MM-DD') as treatment_date, start_time, end_time,COUNT(*) as population",
            "FROM public.treatment_session",
            "LEFT JOIN public.timeslot ON public.treatment_session.timeslot_id = public.timeslot.id",
            "WHERE outlet_id = $1 AND treatment_date >= $2 AND treatment_date <= $3",
            "GROUP BY treatment_date, start_time, end_time",
        ];

        const query = await client.query(queryString.join(" "), [
            outlet_id,
            start_date,
            end_date,
        ]);

        res.json({ message: "database success", patienceArray: query.rows });
        await client.end();
    } catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
};

export const registerSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { identification_number, outlet_id, timeslot_id, treatment_date } =
        req.body;

    if (!identification_number || !outlet_id || !timeslot_id || !treatment_date) {
        const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }

    try {
        const client = new Client();
        await client.connect();

        const queryString = [
            "INSERT INTO public.treatment_session (identification_number,outlet_id,timeslot_id, treatment_date)",
            "SELECT $1,$2,$3,$4",
            "WHERE (SELECT COUNT(*) FROM public.treatment_session WHERE identification_number = $1 AND treatment_date = $4) = 0",
            "AND (SELECT COUNT(*) FROM public.treatment_session WHERE identification_number = $1 AND date_part('week', $4) = date_part('week', treatment_date)) < 2",
            "AND (SELECT COUNT(*) FROM public.treatment_session WHERE timeslot_id = $3 AND treatment_date = $4 AND outlet_id = $2) < 3",
            "RETURNING *",
        ];

        const query = await client.query(queryString.join(" "), [
            identification_number,
            outlet_id,
            timeslot_id,
            treatment_date,
        ]);

        if (query.rows.length > 0) {
            res.json({
                message: "Patient register attendance success",
                patienceArray: query.rows,
            });
        } else {
            let result = {
                message: "Patient register attendance failed",
                patienceArray: [],
            };

            const queryString2 = [
                "SELECT COUNT(*)  FILTER ( WHERE identification_number = $1 AND treatment_date = $2 ) as specific_patient_count_today,",
                "COUNT(*) FILTER( WHERE identification_number = $1 AND date_part('week',  $2) = date_part('week', treatment_date))    as specific_patient_count_week_quota,",
                "COUNT(*) FILTER ( WHERE timeslot_id = $3 AND treatment_date = $2 AND outlet_id = $4)  as patient_count_session",
                "FROM public.treatment_session",
            ];

            const query2 = await client.query(queryString2.join(" "), [
                identification_number,
                treatment_date,
                timeslot_id,
                outlet_id,
            ]);

            if (query2.rows[0].specific_patient_count_today >= 1) {
                result.message = "This patient has register today!";
            } else if (query2.rows[0].specific_patient_count_week_quota >= 2) {
                result.message = "This patient has reach weekly limit!";
            } else if (query2.rows[0].patient_count_session >= 3) {
                result.message = "Busy time slot, try another time slot!";
            }
            res.json(result);
        }
        await client.end();
    } catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
};

export const updatePatientAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id, identification_number } = req.body;

    if (!id || !identification_number) {
        const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
        error.status = 400;
        return next(error);
    }

    try {
        const client = new Client();
        await client.connect();

        const queryString = [
            "UPDATE rehab_center.public.treatment_session",
            "SET attendance = true",
            "WHERE id = $1 AND identification_number = $2",
            "RETURNING *",
        ];

        const query = await client.query(queryString.join(" "), [
            id,
            identification_number,
        ]);

        if (query.rows.length > 0) {
            res.json({ message: "Patient update attendance success" });
        } else {
            res.json({ message: "Patient update attendance failed" });
        }
        await client.end();
    } catch (e) {
        console.log(e);
        res.json({ message: "database error" });
    }
};
