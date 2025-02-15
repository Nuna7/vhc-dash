const roleInputs = document.getElementsByClassName("roleField");
const statusRadios = document.querySelectorAll(".statusField input[type='radio']");
const depotFormSubmit = document.querySelector("#DepotForm>button[type='submit']");

// initialize form submit disabled state
depotFormSubmit.disabled = Array.from(statusRadios).filter((r) => r.checked && r.value == "defer" ).length == roleInputs.length;

// initialize role input disabled state1\
for (const input of roleInputs) {
	const uid = input.name.replace("roles-", "");
	input.disabled = document.querySelector(`input[name="status-${uid}"]:checked`).value != "approve";
}

// status update event listener
for (const radio of statusRadios) {
	radio.addEventListener("change", function (e) {
		// update role inputs disabled state
		const uid = this.name.replace("status-", "");
		document.querySelector(`input[name="roles-${uid}"]`).disabled = this.value != "approve";

		// update form submit disabled state
		depotFormSubmit.disabled = Array.from(statusRadios).filter((r) => r.checked && r.value == "defer" ).length == roleInputs.length;
	});
}