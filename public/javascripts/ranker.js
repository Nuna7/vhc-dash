
// capture elements
const responses = document.querySelectorAll(".Response");
const rankers = document.querySelectorAll(".Response .ranker");
const rank_radios = document.querySelectorAll(".Response .ranker input[type='radio']");
const review = document.getElementById("Review");
const form = document.getElementById("Ballot");

// initialize page
updateRadio();
updateRankData();
updateReviewBox();

// ranker state change event listener
Array.from(rank_radios).forEach(element => {
	element.addEventListener("change", function(e) {		
		// erase duplicate ranker states
		Array.from(rank_radios).filter(radio => radio !== this).forEach(radio => {
			if (radio.value == this.value) { radio.checked = false; }
		});
		
		updateRankData();
		updateReviewBox();
	}, false);
});

// update response element rank data
function updateRankData() {
	Array.from(rankers).forEach(ranker => {
		const checkedRadio = ranker.querySelector("input[type='radio']:checked");
		ranker.parentElement.querySelector(".rankDisplay").innerText = checkedRadio ? "#" + String(checkedRadio.value) : "?";
	})
}

// update review box state
function updateReviewBox() {
	var checkedCount = 0;
	var ranking = Array(rankers.length).fill("<span class='tGray'>?</span>");

	// iterate over rankers and...
	Array.from(rankers).forEach(ranker => {
		const checkedRadio = ranker.querySelector("input[type='radio']:checked");
		if (checkedRadio) { 
			// ...count number of ranked responses
			checkedCount = checkedCount + 1;
			
			// ...update rank array
			ranking[checkedRadio.value - 1] = ranker.parentNode.querySelector(".modelName").innerText; 
		}
	});

	// update rank preview display and disable/enable submission button
	review.innerHTML = `${ranking[0]} > ${ranking[1]} > ${ranking[2]} > ${ranking[3]}`;
	document.querySelector("#Ballot button[type='submit']").disabled = checkedCount != responses.length;
}

// update radio values
function updateRadio() {
	Array.from(rank_radios).forEach(radio => { radio.disabled = false; });

	var pass_count = 0;

	Array.from(responses).forEach(response => {
		const status = response.querySelector(".status input[type='radio']:checked").value;
		if (status == "pass") pass_count++;
	});

	Array.from(responses).forEach(response => {
		const status = response.querySelector(".status input[type='radio']:checked").value;
		
		Array.from(response.querySelectorAll(".ranker input[type='radio']")).forEach(radio => {
			if ((status == "fail" && radio.value <= pass_count) || (status == "pass" && radio.value > pass_count)) { 
				radio.disabled = true; 
				radio.checked = false; 
				radio.dispatchEvent(new Event("change")); // manually dispatch change event to trigger event listener
			}
		});
	});
}

// response navigation hotkeys
hotkeys("left,right,esc", function (event, handler) {
	const e = document.activeElement;

	switch (handler.key) {
		case "right":	
		case "left": 
			const isResponse = e.classList.contains("Response");
			const edgeChild = document.querySelector(`.Response:${handler.key == "left" ? "first" : "last"}-child`);
			const isNotEdge = e !== edgeChild;
			
			if (isResponse && isNotEdge) { handler.key == "left" ? e.previousSibling.focus() : e.nextSibling.focus(); } 
			else { edgeChild.focus(); }
			
			break;

		case "esc":	e.blur(); break;
	}
});

// response ranker hotkeys
hotkeys("1,2,3,4", function (event, handler) {
	const e = document.activeElement;

	if (e.classList.contains("Response")) {
		const radio = e.querySelector(`#radio-${e.id.replace("response-", "")}-${handler.key}`);
		
		if (!radio.disabled) {
			radio.checked = true; 
			radio.dispatchEvent(new Event("change")); // manually dispatch change event to trigger event listener
		}
	}
});

// response status hotkeys
hotkeys("p,f", function (event, handler) {
	const e = document.activeElement;

	if (e.classList.contains("Response")) {
		e.querySelector(`#radio-${e.id.replace("response-", "")}-${handler.key}`).checked = true;
		updateRadio();
	}
});

// form submission hotkey
hotkeys("s, enter", function (event, handler) {
	form.querySelector("button[type='submit']").click();
});