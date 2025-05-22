export function flashMessages(req, res, next) {
	res.locals.flash = req.session.flash;
	
	// reset and assign passthrough flash
	delete req.session.PTFlash;
	req.session.PTFlash = req.session.flash;
	
	delete req.session.flash;
	
	return next();
}

export default {
	flashMessages
};