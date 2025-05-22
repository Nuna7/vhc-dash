exports.sessionAuthCheck = function (roles) {
	return function (req, res, next) {
		// if logged in, verify permissions
		if (req.isAuthenticated()) {
			if (roles && !roles.some(role => req.user.roles.includes(role))) {
				const error = new Error("You don't have permission to access this page");
				error.status = 403;
				return next(error);
			} 
			
			return next();
		} 
		
		// retrieve and reset passthrough flash if exists
		if (req.session.PTFlash) {
			req.session.flash = req.session.PTFlash;
			delete req.session.PTFlash;
		}

		// redirect to login (and save current url for easy return) if not logged in
		req.session.returnTo = req.originalUrl || req.url;
		res.redirect("/login");
	}
}

// make auth data available to templates
exports.sessionAuthData = function (req, res, next) {
	if (req.isAuthenticated()) { res.locals.user = req.user; } 
	return next();
}