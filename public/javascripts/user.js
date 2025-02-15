const infoForm = document.getElementById("InfoForm");
const infoFormSubmit = infoForm.querySelector("button[type='submit']");
const infoFormElements = infoForm.querySelectorAll("input");
const ORCiDButton = document.getElementById("ORCiDButton");
const ORCiDSection = document.getElementById("ORCiDSection");

// disable submit button if no form elements are changed
infoFormSubmit.disabled = true;

for (const element of infoFormElements) {
	if (element.value != element.getAttribute("value")) {
		infoFormSubmit.disabled = false;
		break;
	}
}	

// enable submit button if any form element is changed
for (const element of infoFormElements) {
	element.addEventListener("input", function() {
		infoFormSubmit.disabled = (element.value == element.getAttribute("value"));
	});
}

// show ORCiD field if there are form errors
if (document.querySelector(".FormErrors li[data-field='orcid']")) {
	ORCiDSection.style.display = "block";
	ORCiDButton.style.display = "none";
}

// show ORCiD field on button click
ORCiDButton.addEventListener("click", function() {
	ORCiDSection.style.display = "block";
	ORCiDButton.style.display = "none";

	document.getElementById("ORCiDField").focus();
});