exports.sessionAuthCheck = function (roles) {
	return function (req, res, next) {
		if (req.isAuthenticated()) {
			if (roles && !roles.some(role => req.user.roles.includes(role))) {
				const error = new Error("You don't have permission to access this page");
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