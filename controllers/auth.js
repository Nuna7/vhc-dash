exports.login_get = (req, res, next) => {
	if (req.query.next) { req.session.returnTo = req.query.next }
	res.render("auth/login", { title: "Log In" });
}

exports.login_success_post = (req, res, next) => {
	const returnTo = req.session.returnTo;
	req.session.returnTo = undefined;
	res.redirect(returnTo || "/");
}

exports.login_error_post = (err, req, res, next) => {
	res.render("auth/login", { 
		title: "Log In",
		error: err 
	});
}

exports.logout = (req, res, next) => {
	req.logout();
	res.redirect(req.query.next);
}