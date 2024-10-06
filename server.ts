import express, {RequestHandler} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import {getRehabCenterData, login} from "./controller/adminController";
import patient from "./routes/patient";
import registration from "./routes/registration";
import authenticate from "./middleware/jwtCheck";
import notFound from "./middleware/notFound";
import errorHandler from "./middleware/error";
import headerCheck from "./middleware/headerCheck";
const port = process.env.PORT || 8000;

const app = express();

//TODO: check if bcrypt updated for dependency issue on memory leak

// Body parser middleware for incoming
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const corsOptions = {
  origin: "http://localhost:5173", //(https://your-client-app.com)
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Header check
app.use(headerCheck as RequestHandler);

// Routes
app.post("/api/login", login);
app.get("/api/data", authenticate as RequestHandler, getRehabCenterData);
app.use("/api/patient",authenticate as RequestHandler,  patient);
app.use("/api/session",authenticate as RequestHandler,  registration);

// Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server is running on port ${port}`));
