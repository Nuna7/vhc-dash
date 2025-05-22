// HOMEPAGE ====================================================================

export function home(req, res, next) {
	res.render("home", { title: "Ashoka VHC" });
}

// DEFAULT EXPORT ==============================================================

export default {
	home
};