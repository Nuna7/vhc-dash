import { flashAndRedirect } from "../helpers/flash.js";

// HOMEPAGE ====================================================================

export function home(req, res, next) {
	if (req.session.PTFlash) {
		return flashAndRedirect(req, res, "message", req.session.PTFlash["message"], "/ranker");
	}

	else res.redirect("/ranker");
}

// DEFAULT EXPORT ==============================================================

export default {
	home
};