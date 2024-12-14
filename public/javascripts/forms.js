document.addEventListener("submit", function(e) {
	e.target.submit(function() { return false; })
	e.target.querySelector("button[type='submit']").disabled = true; 
	e.target.querySelector("button[type='submit']").classList.add("sLoading"); 
}, true);