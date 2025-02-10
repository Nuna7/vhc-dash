// settings
const minFontSize = 12;
const maxFontSize = 18;

// capture elements
const content = document.getElementById("Content");
const navLinks = document.querySelectorAll("#Navigation .link");

// initialize page font size
const savedSize = localStorage.getItem("fontSize");
if (savedSize) content.style.fontSize = savedSize;

// initialize settings counters
updateSettingsDisplay();

// increment/decrement base font size (12 <= x <= 18)
function zoom(mode) {
	const fontSize = Math.max(Math.min(parseFloat(window.getComputedStyle(content).fontSize) + (mode == "in" ? 1 : -1), maxFontSize), minFontSize);
	content.style.fontSize = `${fontSize}px`;
	localStorage.setItem("fontSize", fontSize);
	updateSettingsDisplay();
}

// update settings counters
function updateSettingsDisplay() {
	document.getElementById("fontSize").innerHTML = window.getComputedStyle(content).fontSize;
}

// site zoom hotkeys
hotkeys("ctrl+=, ctrl+-", function (event, handler) {
	event.preventDefault();
	zoom(handler.key == "ctrl+=" ? "in" : "out");
});

// response navigation hotkeys
hotkeys("ctrl+0, ctrl+1, ctrl+2, ctrl+3, ctrl+4, ctrl+5, ctrl+6, ctrl+7, ctrl+8, ctrl+9", function (event, handler) {
	Array.from(navLinks)[handler.key.slice(-1)].querySelector("a").click();
});