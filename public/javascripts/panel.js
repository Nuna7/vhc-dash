const ORCiDButton = document.getElementById("ORCiDButton");
const ORCiDSection = document.getElementById("ORCiDSection");

// show ORCiD field if there are form errors
if (document.querySelector(".FormErrors li[data-field='orcid']")) {
	ORCiDSection.style.display = "block";
	ORCiDButton.style.display = "none";
}

// show ORCiD field on button click
ORCiDButton.addEventListener("click", function() {
	ORCiDSection.style.display = "block";
	ORCiDButton.style.display = "none";
});