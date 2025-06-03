// capture elements
const responses = document.querySelectorAll(".response");

for (const response of responses) {
	response.addEventListener("click", function (e) {
		const siblings = [...this.parentElement.children]
        	.filter(child => child !== this);

		// collapse all
		for (const sibling of siblings) sibling.classList.remove("sExpanded");

		// expand this response
		this.classList.add("sExpanded");
	});
}