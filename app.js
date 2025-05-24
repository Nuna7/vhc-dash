import dotenv from "dotenv";

dotenv.config();

// IMPORTS =====================================================================

// core functionality
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import express from "express"

// requests & session
import cookieParser from "cookie-parser";
import session from "cookie-session";

// logging
import { createStream } from "rotating-file-stream";
import morgan from "morgan";

// security & auth
import passport from "passport";

// error handling
import createError from "http-errors";

// database
import mongoose from "mongoose";

// custom middleware -----------------------------------------------------------
import { sessionAuthData } from "./middleware/auth.js";
import { flashMessages } from "./middleware/flash.js";

// user model ------------------------------------------------------------------
import User from "./models/User.js";

// routers ---------------------------------------------------------------------
import authRouter from "./routes/auth.js";
import indexRouter from "./routes/index.js";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";
import rankerRouter from "./routes/ranker.js";

// PATH SETUP ==================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// LOGGING =====================================================================

const logDirectory = join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

// rotating write stream: one file per day, keep 30 days
const accessLogStream = createStream("access.log", {
	interval: "1d",
	path: logDirectory,
	maxFiles: 30
});

// APP DEFINITION ==============================================================

const app = express();

// mongodb connection ----------------------------------------------------------
const connect_db = async () => { return mongoose.connect(process.env.MONGODB_URL); }

connect_db().then(conn => {
	console.log(`MongoDB connected: ${conn.connection.host}`);
	app.listen(() => console.log("Listening for requests"));
}).catch(err => console.error("MongoDB connection error:", err));

// app settings ----------------------------------------------------------------
app.set("views", join(__dirname, "views"));
app.set("view engine", "pug");

// app middleware --------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, "public")));

app.use(process.env.NODE_ENV === "production"
	? morgan("combined", { stream: accessLogStream })
	: morgan("dev")
);

app.use(cookieParser());
app.use(session({
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
	secret: process.env.SESSION_SECRET
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(sessionAuthData);
app.use(flashMessages);

// template url access middleware ----------------------------------------------
app.use(function (req, res, next) {
	const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl || req.url}`;
	res.locals.url = new URL(fullUrl).pathname;
	return next();
});

// routing ---------------------------------------------------------------------
app.use("/", authRouter);
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/ranker", rankerRouter);

// error handling ----------------------------------------------------------
app.use((req, res, next) => next(createError(404, "Resource not found.")));

app.use(function (err, req, res, next) {
	res.status(err.status || 500).render("error", {
		status: err.status,
		message: err.message,
		returnURL: err.returnURL
	});
});

// passport auth. management ---------------------------------------------------
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// DEFAULT EXPORT ===============================================================

export default app;
