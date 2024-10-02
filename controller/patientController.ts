import { NextFunction, Request, Response } from "express";
import { Client } from "pg";

interface ErrorWithStatus extends Error {
  status?: number;
}

export const getPatientList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { page } = req.query;

  if (typeof page !== "string") {
    const error: ErrorWithStatus = new Error(`Invalid query submitted`);
    error.status = 400;
    return next(error);
  }

  const pagePG = parseInt(page) > 1 ? (parseInt(page) - 1) * 50 : 0;

  try {
    const client = new Client();
    await client.connect();

    const query = await client.query(
      "SELECT identification_number, fullname, date_of_birth, gender, phone_number, home_address, email, recover FROM rehab_center.public.customer  OFFSET $1 LIMIT 50",
      [pagePG],
    );

    res.json({ message: "database success", patienceArray: query.rows });
    await client.end();
  } catch (e) {
    console.log(e);
    res.json({ message: "database error" });
  }
};

export const getRegistrationByPatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { identification_number, page } = req.query;

  if (!identification_number || !page) {
    const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
    error.status = 400;
    return next(error);
  }

  if (typeof page !== "string") {
    const error: ErrorWithStatus = new Error(`Invalid query submitted`);
    error.status = 400;
    return next(error);
  }

  const pagePG = parseInt(page) > 1 ? (parseInt(page) - 1) * 50 : 0;

  try {
    const client = new Client();
    await client.connect();

    const queryString = [
      "SELECT outlet_name, treatment_date, start_time, end_time",
      "FROM public.treatment_session",
      "LEFT JOIN public.timeslot ON public.rehab_center.timeslot_id = public.timeslot.id",
      "LEFT JOIN public.outlet_location ON public.rehab_center.outlet_id = public.outlet_location.id",
      "WHERE identification_number = $1",
      "OFFSET $2 LIMIT 50",
    ];

    const query = await client.query(queryString.join(" "), [
      identification_number,
      pagePG,
    ]);

    res.json({ message: "database success", patienceArray: query.rows });
    await client.end();
  } catch (e) {
    console.log(e);
    res.json({ message: "database error" });
  }
};

export const createNewPatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    identification_number,
    fullname,
    date_of_birth,
    gender,
    phone_number,
    home_address,
    email,
  } = req.body;

  if (
    !identification_number ||
    !fullname ||
    !date_of_birth ||
    !gender ||
    !phone_number ||
    !home_address.street ||
    !home_address.city ||
    !home_address.state ||
    !home_address.postcode ||
    !home_address.country ||
    !email
  ) {
    const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
    error.status = 400;
    return next(error);
  }

  try {
    const client = new Client();
    await client.connect();

    const query = await client.query(
      "INSERT INTO rehab_center.public.customer (identification_number,fullname,date_of_birth,gender,phone_number,home_address,email) VALUES($1,$2,$3,$4,$5,($6,$7,$8,$9,$10),$11) RETURNING *",
      [
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
      ],
    );

    if (query.rows.length > 0) {
      res.json({ message: "Patient create success", result: query.rows[0] });
    } else {
      res.json({ message: "Patient create failed", result: [] });
    }
    await client.end();
  } catch (e) {
    console.log(e);
    res.json({ message: "database error" });
  }
};

export const updatePatientDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { identification_number, phone_number, home_address, email, recovery } =
    req.body;

  if (
    !identification_number ||
    !phone_number ||
    !home_address.street ||
    !home_address.city ||
    !home_address.state ||
    !home_address.postcode ||
    !home_address.country ||
    !email ||
    !recovery
  ) {
    const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
    error.status = 400;
    return next(error);
  }

  try {
    const client = new Client();
    await client.connect();

    const query = await client.query(
      "UPDATE rehab_center.public.customer SET phone_number=$1,home_address=($2,$3,$4,$5,$6),email = $7,recover= $8 WHERE identification_number=$9 RETURNING *",
      [
        phone_number,
        home_address.street,
        home_address.city,
        home_address.state,
        home_address.postcode,
        home_address.country,
        email,
        recovery,
        identification_number,
      ],
    );

    if (query.rows.length > 0) {
      res.json({ message: "Patient edit success" });
    } else {
      res.json({ message: "Patient create failed" });
    }
    await client.end();
  } catch (e) {
    console.log(e);
    res.json({ message: "database error" });
  }
};
