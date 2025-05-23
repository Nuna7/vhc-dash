import createError from "http-errors";

// MIDDLEWARE ==================================================================

// restricted-access management
export function sessionAuthCheck({ roles, returnTo } = {}) {
	return function (req, res, next) {
		// if logged in, verify permissions
		if (req.isAuthenticated()) {
			if (roles && !roles.some(role => req.user.roles.includes(role))) {
				return next(createError(403, "You don't have permission to access this page"));
			}

			return next();
		}

		// retrieve and reset passthrough flash if exists
		if (req.session.PTFlash) {
			req.session.flash = req.session.PTFlash;
			delete req.session.PTFlash;
		}

		// redirect to login (and save current url for easy return) if not logged in
		req.session.returnTo = returnTo || (req.originalUrl || req.url);
		res.redirect("/login");
	}
}

// make auth data available to templates ---------------------------------------
export function sessionAuthData(req, res, next) {
	if (req.isAuthenticated()) { res.locals.user = req.user; }
	return next();
}

// DEFAULT EXPORT ==============================================================

export default {
	sessionAuthCheck,
	sessionAuthData
};