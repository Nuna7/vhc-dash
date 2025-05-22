export function home(req, res, next) {
	res.render("home", { title: "Ashoka VHC" });
}

export default {
	home
};