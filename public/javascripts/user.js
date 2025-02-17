const infoForm = document.getElementById("InfoForm");
const infoFormSubmit = infoForm.querySelector("button[type='submit']");
const infoFormElements = infoForm.querySelectorAll("input");

// disable submit button if no form elements are changed
infoFormSubmit.disabled = Array.from(infoFormElements).filter((e) => e.value == e.getAttribute("value") ).length == infoFormElements.length;

// enable submit button if any form element is changed
for (const element of infoFormElements) {
	element.addEventListener("input", function() {
		infoFormSubmit.disabled = (element.value == element.getAttribute("value"));
	});
}