import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../backend/utils/db.js";
import userRoute from "../backend/routes/user.route.js";
import companyRoute from "../backend/routes/company.route.js";
import jobRoute from "../backend/routes/job.route.js";
import applicationRoute from "../backend/routes/application.route.js";

dotenv.config({});    // Load environment variables from .env file

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
};

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

//api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', success: false });
});

// http://localhost:8000/api/v1/user/register
app.listen(PORT, () => {
    connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});