export function flashAndRedirect(req, res, type, body, route) {
	req.session.flash ??= {}
	req.session.flash[type] = body;
	res.redirect(route);
}

// DEFAULT EXPORT ==============================================================

export default {
	flashAndRedirect
};