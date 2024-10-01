"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const adminController_1 = require("./controller/adminController");
const patient_1 = __importDefault(require("./routes/patient"));
// import authenticate from "./middleware/jwtCheck";
const notFound_1 = __importDefault(require("./middleware/notFound"));
const error_1 = __importDefault(require("./middleware/error"));
const headerCheck_1 = __importDefault(require("./middleware/headerCheck"));
const port = process.env.PORT || 8000;
const app = (0, express_1.default)();
//TODO: check if bcrypt updated for dependency issue on memory leak
// Body parser middleware for incoming
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: "http://localhost:5173", //(https://your-client-app.com)
    optionsSuccessStatus: 200,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Header check
app.use(headerCheck_1.default);
// Routes
app.post("/api/login", adminController_1.login);
app.use("/api/patient", patient_1.default);
// app.use("/api/patient", authenticate, patient);
// Error handler
app.use(notFound_1.default);
app.use(error_1.default);
app.listen(port, () => console.log(`Server is running on port ${port}`));
