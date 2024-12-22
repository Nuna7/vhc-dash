// disable form submit button on submit to prevent double submission
document.addEventListener("submit", function(e) {
	e.target.submit(function() { return false; })
	const button = e.target.querySelector("button[type='submit']");
	button.disabled = true; 
	button.classList.add("sLoading"); 
}, true);