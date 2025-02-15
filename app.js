require("dotenv").config();

var createError = require("http-errors");
var express = require("express");	
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("cookie-session");
const passport = require("passport");
const url = require("url");

const authMiddleware = require("./middleware/auth");
const formMiddleware = require("./middleware/form");
const flashMiddleware = require("./middleware/flash");

const User = require("./models/User");

var authRouter = require("./routes/auth");
var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var rankerRouter = require("./routes/ranker");

var app = express();

const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const connect_db = async () => { return await mongoose.connect(process.env.MONGODB_URL); }

connect_db().then(conn => {
	console.log(`MongoDB connected: ${conn.connection.host}`);
	app.listen(() => console.log("Listening for requests"));
}).catch(err => console.log(err));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false },
	secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(authMiddleware.sessionAuthData);
app.use(formMiddleware.formErrorData);
app.use(flashMiddleware.flashMessages);

app.use(function(req, res, next) { // provide current url as local template variable
	res.locals.url = url.parse(req.originalUrl || req.url).pathname;
	return next();
});

app.use("/", authRouter);
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/ranker", rankerRouter);

app.use(function(req, res, next) {
	next(createError(404));
});

app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500);
	res.render("error");
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = app;
