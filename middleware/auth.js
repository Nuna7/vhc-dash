exports.sessionAuthCheck = function (status) {
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			if (status && !req.user.roles.includes(status)) {
				const error = new Error("You don't have permission to acess this page");
				error.status = 403;
				return next(error);
			} else { return next(); }
		} else {
			req.session.returnTo = req.originalUrl || req.url
			res.redirect("/login") 
		}
	}
}

exports.sessionAuthData = function (req, res, next) {
	if (req.isAuthenticated()) { res.locals.user = req.user; } 
	return next();
}