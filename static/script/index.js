getMembers();
getPresence();

const addMemberButton = document.getElementById("add-member-button");
const memberInput = document.getElementById("member-input");
const submitButton = document.getElementById("submit-button");
const deleteMemberButton = document.getElementById("delete-member-button");
const deletePresenceButton = document.getElementById("delete-presence-button");
const BirthdaysInput = document.getElementById("birthdays-input");

setInterval(getPresence, 60000);
setInterval(getMembers, 60000);


document.addEventListener("DOMContentLoaded", () => {
    const filterInput = document.getElementById("filter-name");
    if (filterInput) {
        filterInput.addEventListener("input", getMembers);
    }
});

function getMembers() {
    fetch(`/members`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            logSuccess("Récupération des membres", data);
            const membersList = document.getElementById("members-list");
            const filterInput = document.getElementById("filter-name");

            const checkedMembers = new Set();

            function updateList() {
                const filterValue = filterInput.value.toLowerCase();

                document.querySelectorAll(".member-checkbox").forEach(checkbox => {
                    if (checkbox.checked) {
                        checkedMembers.add(checkbox.value);
                    } else {
                        checkedMembers.delete(checkbox.value);
                    }
                });

                membersList.innerHTML = "";

                const filteredData = data.filter(member =>
                    member.toLowerCase().startsWith(filterValue)
                );

                if (filteredData.length === 0) {
                    membersList.innerHTML = `<li class="list-group-item text-danger">Aucun membre trouvé</li>`;
                } else {
                    filteredData.forEach(member => {
                        let li = document.createElement("li");
                        li.classList.add("list-group-item", "d-flex", "align-items-center", "clickable-item");

                        let label = document.createElement("label");
                        label.classList.add("w-100", "d-flex");
                        label.setAttribute("for", `member-${member}`);

                        let input = document.createElement("input");
                        input.id = `member-${member}`;
                        input.type = "checkbox";
                        input.value = member;
                        input.classList.add("form-check-input", "me-2", "member-checkbox");

                        input.checked = checkedMembers.has(member);

                        label.appendChild(input);
                        label.append(member);
                        li.appendChild(label);
                        membersList.appendChild(li);
                    });
                }
            }

            updateList();
            filterInput.addEventListener("input", updateList);
        })
        .catch(error => logError("getMembers", error));
}

// Récupère la liste des présences
function getPresence() {
    fetch(`/presences`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            logSuccess("Récupération des présences", data);
            const presenceList = document.getElementById("presence-list");
            presenceList.innerHTML = "";

            data.forEach(member => {
                let li = document.createElement("li");
                li.classList.add("list-group-item", "d-flex", "align-items-center");
            
                let label = document.createElement("label");
                label.classList.add("w-100", "d-flex", "align-items-center"); // Permet un clic global
                label.setAttribute("for", `${member}-presence`);
            
                let input = document.createElement("input");
                input.id = `${member}-presence`;
                input.type = "checkbox";
                input.value = member;
                input.classList.add("form-check-input", "me-2", "presence-checkbox");
            
                label.appendChild(input);
                label.append(member);
                li.appendChild(label);
                presenceList.appendChild(li);
            });
        })
        .catch(error => logError("getPresence", error));
}

// Ajoute un membre
addMemberButton.addEventListener("click", () => {
    const newMember = memberInput.value.trim();
    const birthdays = BirthdaysInput.value.trim();
    if (!newMember || !birthdays) {
        alert("Veuillez entrer un nom et une date valide.");
        return;
    }
    
    const requestData = { members: [{ nom: newMember, birthday: birthdays }] };
    console.log("Données envoyées :", JSON.stringify(requestData));  // Debug
    
    fetch(`/add_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur :", data);  // Debug
            if (data.error) {
                logError("addMember", data.error);
            } else {
                logSuccess("Ajout de membre", data);
                getMembers();
            }
        })
        .catch(error => logError("addMember", error));
    
    memberInput.value = "";
    BirthdaysInput.value = "";
    
});

// Ajoute les membres présents
submitButton.addEventListener("click", () => {
    const checked = document.querySelectorAll(".member-checkbox:checked");
    if (checked.length === 0) {
        alert("Aucun membre sélectionné.");
        return;
    }

    const selectedMembers = Array.from(checked).map(member => member.value);

    fetch(`/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
        .then(response => response.json())
        .then(data => {
            document.querySelectorAll(".member-checkbox").forEach(checkbox => {
                checkbox.checked = false;
            }); 
            logSuccess("Ajout de présences", data);
            getPresence();
        })
        .catch(error => logError("submitPresence", error));
});

// Supprime les membres sélectionnés
deleteMemberButton.addEventListener("click", () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;

    const checked = document.querySelectorAll(".member-checkbox:checked");
    if (checked.length === 0) {
        alert("Aucun membre sélectionné.");
        return;
    }

    const selectedMembers = Array.from(checked).map(member => member.value);

    fetch(`/delete_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
        .then(response => response.json())
        .then(data => {
            logSuccess("Suppression de membres", data);
            getMembers();
            getPresence();
        })
        .catch(error => logError("deleteMembers", error));
});

// Supprime des présences
deletePresenceButton.addEventListener("click", () => {
    if (!window.confirm("Voulez-vous vraiment supprimer la présence des membres sélectionnés ?")) return;

    const checked = document.querySelectorAll(".presence-checkbox:checked");
    if (checked.length === 0) {
        alert("Aucun membre sélectionné.");
        return;
    }

    const selectedMembers = Array.from(checked).map(member => member.value);

    fetch(`/delete_presences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
        .then(response => response.json())
        .then(data => {
            logSuccess("Suppression de présences", data);
            getPresence();
        })
        .catch(error => logError("deletePresence", error));
});

// obtenir la liste des membres supprimés
function getDeletedMembers() {
    fetch(`/get_deleted_members`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            logSuccess("Récupération des membres supprimés", data);
            deleteMembersList.innerHTML = "";

            data.forEach(member => {
                let li = document.createElement("li");
                li.classList.add("list-group-item", "d-flex", "align-items-center");
            
                let label = document.createElement("label");
                label.classList.add("w-100", "d-flex", "align-items-center");
                label.setAttribute("for", `${member}-delete`);
            
                let input = document.createElement("input");
                input.id = `${member}-delete`;
                input.type = "checkbox";
                input.value = member;
                input.classList.add("form-check-input", "me-2", "delete-checkbox");
            
                label.appendChild(input);
                label.append(member);
                li.appendChild(label);
                deleteMembersList.appendChild(li);
            });
            
        })
        .catch(error => logError("getDeletedMembers", error));
}
