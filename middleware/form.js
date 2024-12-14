exports.formErrorData = function (req, res, next) {
	res.locals.errors = req.session.errors;
	req.session.errors = undefined;
	return next();
}