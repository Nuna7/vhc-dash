
// capture elements
const responses = document.querySelectorAll(".Response");
const rankRadios = document.querySelectorAll(".Response .ranker input[type='radio']");
const statusRadios = document.querySelectorAll(".Response .status input[type='radio']");
const review = document.getElementById("Review");
const form = document.getElementById("Ballot");

// initialize rankers
markTaken();
passFailSplit();
updateRankData();
updateReviewBox();

// ranker state change event listener
for (const radio of rankRadios) {
	radio.addEventListener("change", function (e) {
		// erase duplicate ranker states
		if (this.checked) {
			for (const radio of Array.from(rankRadios).filter(radio => radio !== this)) {
				if (radio.value == this.value) radio.checked = false;
			}
		}

		markTaken();
		updateRankData();
		updateReviewBox();
	}, false);
}

// status state change event listener
for (const radio of statusRadios) {
	radio.addEventListener("change", function (e) {
		passFailSplit();
	}, false);
}

// update response element rank data
function updateRankData() {
	for (const response of responses) {
		const checkedRadio = response.querySelector(".ranker input[type='radio']:checked");
		response.querySelector(".rankDisplay").innerText = checkedRadio ? "#" + String(checkedRadio.value) : "?";
	}
}

// update review box state
function updateReviewBox() {
	var ranking = Array(responses.length).fill("?");
	
	var failCount = 0;
	
	// count number of ranked and failing responses and update rank array
	for (const response of responses) {
		const checkedRankRadio = response.querySelector(".ranker input[type='radio']:checked");
		const checkedStatusRadio = response.querySelector(".status input[type='radio']:checked");

		if (checkedStatusRadio.value === "fail") failCount++;

		// convert index to uppercase letter
		if (checkedRankRadio) ranking[checkedRankRadio.value - 1] = String.fromCharCode(65 + Number(response.querySelector(".modelName").dataset.index));
	};

	// update rank review display
	const passSegment = (failCount > 0 ? ranking.slice(0, -failCount) : ranking).join(" > ");
	const failSegment = failCount > 0 ? `<span class="failSeg">${ranking.slice(-failCount).join(" > ")}</span>` : ""
	review.innerHTML = [passSegment, failSegment].filter(Boolean).join(" > ")

	// disable/enable submission button
	document.querySelector("#Ballot button[type='submit']").disabled = ranking.filter(e => e !== "?").length != responses.length;
}

// update radio values
function passFailSplit() {
	for (const radio of rankRadios) radio.disabled = false;

	// count passing responses
	const passCount = [...responses]
		.filter(s => s.querySelector(".status input[type='radio']:checked").value === "pass")
		.length;

	// disable appropriate rank range for each response
	for (const response of responses) {
		const status = response.querySelector(".status input[type='radio']:checked").value;

		for (const radio of response.querySelectorAll(".ranker input[type='radio']")) {
			if ((status == "fail" && radio.value <= passCount) || (status == "pass" && radio.value > passCount)) {
				radio.disabled = true;
				radio.checked = false;
				radio.dispatchEvent(new Event("change"));
			}
		}
	}

	updateReviewBox();
}

// visually mark occupied ranks
function markTaken() {
	const selectedRadios = document.querySelectorAll(".Response .ranker input[type='radio']:checked");
	const selectedValues = Array.from(selectedRadios).map(radio => radio.value);

	for (const radio of rankRadios) {
		if (selectedValues.includes(radio.value)) radio.classList.add("sTaken");
		else radio.classList.remove("sTaken");
	}
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

		case "esc": e.blur(); break;
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
hotkeys("`", function (event, handler) {
	const e = document.activeElement;

	if (e.classList.contains("Response")) {
		e.querySelector(".status input[type='radio']:not(:checked)").checked = true;
		passFailSplit();
	}
});

// form submission hotkey
hotkeys("s, enter", function (event, handler) {
	form.querySelector("button[type='submit']").click();
});