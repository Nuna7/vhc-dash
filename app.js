require("dotenv").config();

// IMPORTS =====================================================================

// core functionality
const express = require("express");	
const path = require("path");
const url = require("url");

// requests & session
const cookieParser = require("cookie-parser");
const session = require("cookie-session");
const logger = require("morgan");

// security & auth
const helmet = require("helmet");
const passport = require("passport");

// error handling
const createError = require("http-errors");

// custom middleware -----------------------------------------------------------
const authMiddleware = require("./middleware/auth");
const flashMiddleware = require("./middleware/flash");

// user model ------------------------------------------------------------------
const User = require("./models/User");

// routers ---------------------------------------------------------------------
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const rankerRouter = require("./routes/ranker");

// APP DEFINITION ==============================================================

const app = express();

// mongodb connection ----------------------------------------------------------
const mongoose = require("mongoose");
const connect_db = async () => { return mongoose.connect(process.env.MONGODB_URL); }

connect_db().then(conn => {
	console.log(`MongoDB connected: ${conn.connection.host}`);
	app.listen(() => console.log("Listening for requests"));
}).catch(err => console.error("MongoDB connection error:", err));

// app settings ----------------------------------------------------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// app middleware --------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use(session({
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
	secret: process.env.SESSION_SECRET
}));
app.use(logger("dev"));

app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());

app.use(authMiddleware.sessionAuthData);
app.use(flashMiddleware.flashMessages);

// template url access middleware ----------------------------------------------
app.use(function(req, res, next) {
	res.locals.url = url.parse(req.originalUrl || req.url).pathname;
	return next();
});

// routing ---------------------------------------------------------------------
app.use("/", authRouter);
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/ranker", rankerRouter);

// error handling ----------------------------------------------------------
app.use((req, res, next) => next(createError(404)));

app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500);
	res.render("error");
});

// passport auth. management ---------------------------------------------------
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MODULE EXPORT ===============================================================

module.exports = app;
