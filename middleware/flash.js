exports.flashMessages = function (req, res, next) {
	res.locals.flash = req.session.flash;
	req.session.flash = undefined;
	return next();
}