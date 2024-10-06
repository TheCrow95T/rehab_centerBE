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

  const pagePG = parseInt(page) > 1 ? (parseInt(page) - 1) * 10 : 0;

  try {
    const client = new Client();
    await client.connect();

    const queryString = [
      "SELECT identification_number, fullname, to_char(date_of_birth,'YYYY-MM-DD') AS date_of_birth, gender, recover",
      "FROM rehab_center.public.customer",
      "OFFSET $1 LIMIT 10",
    ];

    const query = await client.query(queryString.join(" "), [pagePG]);

    const query2 = await client.query(
      "SELECT COUNT(*) as total_record FROM rehab_center.public.customer",
      [],
    );

    const totalPage = Math.ceil(query2.rows[0].total_record / 10);

    res.json({
      message: "database success",
      patienceTotalPage: totalPage,
      patienceArray: query.rows,
    });
    await client.end();
  } catch (e) {
    console.log(e);
    res.json({ message: "database error" });
  }
};

export const getPatientDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { identification_number } = req.body;

  if (!identification_number) {
    const error: ErrorWithStatus = new Error(`Insufficient body submitted`);
    error.status = 400;
    return next(error);
  }

  try {
    const client = new Client();
    await client.connect();

    const queryString = [
      "SELECT identification_number, fullname, to_char(date_of_birth,'YYYY-MM-DD') as date_of_birth, gender, phone_number, home_address, email, recover",
      "FROM rehab_center.public.customer",
      "WHERE identification_number = $1",
    ];

    const query = await client.query(queryString.join(" "), [
      identification_number,
    ]);

    const query2 = await client.query(
      "SELECT COUNT(*) as total_record FROM rehab_center.public.customer",
      [],
    );

    const totalPage = Math.ceil(query2.rows[0].total_record / 10);

    res.json({
      message: "database success",
      patienceTotalPage: totalPage,
      patienceArray: query.rows,
    });
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
  const { page } = req.query;
  const { identification_number } = req.body;

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

  const pagePG = parseInt(page) > 1 ? (parseInt(page) - 1) * 10 : 0;

  try {
    const client = new Client();
    await client.connect();

    const queryString = [
      "SELECT public.treatment_session.id, outlet_id, outlet_name, to_char(treatment_date,'YYYY-MM-DD') AS treatment_date, start_time, end_time, attendance",
      "FROM public.treatment_session",
      "LEFT JOIN public.timeslot ON public.treatment_session.timeslot_id = public.timeslot.id",
      "LEFT JOIN public.outlet_location ON public.treatment_session.outlet_id = public.outlet_location.id",
      "WHERE identification_number = $1",
      "ORDER BY treatment_date, start_time",
      "OFFSET $2 LIMIT 10",
    ];

    const query = await client.query(queryString.join(" "), [
      identification_number,
      pagePG,
    ]);

    const queryString2 = [
      "SELECT COUNT(*) as total_record FROM public.treatment_session",
      "WHERE identification_number = $1",
    ];
    const query2 = await client.query(queryString2.join(" "), [
      identification_number,
    ]);

    const totalPage = Math.ceil(query2.rows[0].total_record / 10);

    res.json({
      message: "database success",
      patienceTotalPage: totalPage,
      patienceArray: query.rows,
    });
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

    const queryString = [
      "INSERT INTO public.customer (identification_number,fullname,date_of_birth,gender,phone_number,home_address,email)",
      "VALUES($1,$2,$3,$4,$5,($6,$7,$8,$9,$10),$11)",
      "RETURNING *",
    ];

    const query = await client.query(queryString.join(" "), [
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

    const queryString = [
      "UPDATE public.customer",
      "SET phone_number=$1,home_address=($2,$3,$4,$5,$6),email = $7,recover= $8",
      "WHERE identification_number=$9 RETURNING *",
    ];

    const query = await client.query(queryString.join(" "), [
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
      res.json({ message: "Patient edit success", result: query.rows[0] });
    } else {
      res.json({ message: "Patient edit failed", result: [] });
    }
    await client.end();
  } catch (e) {
    console.log(e);
    res.json({ message: "database error" });
  }
};
