// capture elements
const navLinks = document.querySelectorAll("#Navigation .link");

// response navigation hotkeys
hotkeys("ctrl+0, ctrl+1, ctrl+2, ctrl+3, ctrl+4, ctrl+5, ctrl+6, ctrl+7, ctrl+8, ctrl+9", function (event, handler) {
	Array.from(navLinks)[handler.key.slice(-1)].querySelector("a").click();
});