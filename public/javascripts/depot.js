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

// table navigation hotkeys
hotkeys("up,down,esc", function (event, handler) {
	const e = document.activeElement;
	
	if (e.classList.contains("RegistrationRequest")) {
		switch (handler.key) {
			case "up":
			case "down":
				const edgeChild = document.querySelector(`.RegistrationRequest:${handler.key == "up" ? "first" : "last"}-of-type`);

				if (e !== edgeChild) handler.key == "up" ? e.previousSibling.focus() : e.nextSibling.focus();
				else edgeChild.focus();
	
				break;
	
			case "esc": 
				e.blur(); 
				break;
		}
	}
});

// request status hotkeys
hotkeys("`", function (event, handler) {
	const e = document.activeElement;

	if (e.classList.contains("RegistrationRequest")) {
		const radios = [...e.querySelectorAll(".statusField input[type='radio']")];
		const nextIndex = (radios.findIndex(r => r.checked) + 1) % radios.length;
		
		radios[nextIndex].checked = true;
		radios[nextIndex].dispatchEvent(new Event("change"));
	}
});