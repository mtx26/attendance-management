getMembers();
getPresence();
getDeletedMembers();

const addMemberButton = document.getElementById("add-member-button");
const memberInput = document.getElementById("member-input");
const submitButton = document.getElementById("submit-button");
const deleteMemberButton = document.getElementById("delete-member-button");
const deletePresenceButton = document.getElementById("delete-presence-button");
const deleteMembersList = document.getElementById("delete-members-list");
const RestoreMemberButton = document.getElementById("restore-member-button");

setInterval(getPresence, 60000);
setInterval(getMembers, 60000);
setInterval(getDeletedMembers, 60000);

// Fonction générique pour afficher les erreurs
function logError(context, error) {
    console.error(`[Erreur - ${context}]`, error);
}

// Fonction générique pour afficher les succès
function logSuccess(context, message) {
    console.log(`[Succès - ${context}]`, message);
}

// Récupère la liste des membres
function getMembers() {
    fetch(`/members`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            logSuccess("Récupération des membres", data);
            const membersList = document.getElementById("members-list");
            membersList.innerHTML = "";

            data.forEach(member => {
                let li = document.createElement("li");
                li.classList.add("list-group-item", "d-flex", "align-items-center");

                let div = document.createElement("div");
                div.classList.add("form-check");

                let input = document.createElement("input");
                let label = document.createElement("label");

                input.id = member;
                input.type = "checkbox";
                input.value = member;
                input.classList.add("form-check-input", "me-2", "member-checkbox");

                label.htmlFor = member;
                label.textContent = member;
                label.classList.add("form-check-label");

                div.appendChild(input);
                div.appendChild(label);
                li.appendChild(div);
                membersList.appendChild(li);
            });
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

                let div = document.createElement("div");
                div.classList.add("form-check");

                let input = document.createElement("input");
                let label = document.createElement("label");

                input.id = member + "-presence";
                input.type = "checkbox";
                input.value = member;
                input.classList.add("form-check-input", "me-2", "presence-checkbox");

                label.htmlFor = member + "-presence";
                label.textContent = member;
                label.classList.add("form-check-label");

                div.appendChild(input);
                div.appendChild(label);
                li.appendChild(div);
                presenceList.appendChild(li);
            });
        })
        .catch(error => logError("getPresence", error));
}

// Ajoute un membre
addMemberButton.addEventListener("click", () => {
    const newMember = memberInput.value.trim();
    if (!newMember) {
        alert("Veuillez entrer un nom de membre valide.");
        return;
    }

    fetch(`/add_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member: [newMember] })
    })
        .then(response => response.json())
        .then(data => {
            logSuccess("Ajout de membre", data);
            getMembers();
        })
        .catch(error => logError("addMember", error));

    memberInput.value = "";
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
            logSuccess("Ajout de présences", data);
            getPresence();
        })
        .catch(error => logError("submitPresence", error));
});

// Supprime les membres sélectionnés
deleteMemberButton.addEventListener("click", () => {
    if (!window.confirm("Voulez-vous vraiment supprimer les membres sélectionnés ?")) return;

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
            getDeletedMembers();
        })
        .catch(error => logError("deleteMembers", error));
});

// Supprime les présences
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

// Récupère les membres supprimés
function getDeletedMembers() {
    fetch(`/deleted_members`)
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

                let div = document.createElement("div");
                div.classList.add("form-check");

                let input = document.createElement("input");
                input.id = member + "-delete";
                input.type = "checkbox";
                input.value = member;
                input.classList.add("form-check-input", "me-2", "delete-checkbox");

                let label = document.createElement("label");
                label.htmlFor = member + "-delete";
                label.textContent = member;
                label.classList.add("form-check-label");

                div.appendChild(input);
                div.appendChild(label);
                li.appendChild(div);
                deleteMembersList.appendChild(li);
            });
        })
        .catch(error => logError("getDeletedMembers", error));
}


RestoreMemberButton.addEventListener("click", () => {
    if (!window.confirm("Voulez-vous vraiment restaurer les membres sélectionnés ?")) return;

    const checked = document.querySelectorAll(".delete-checkbox:checked");
    if (checked.length === 0) {
        alert("Aucun membre sélectionné pour la restauration.");
        return;
    }

    const selectedMembers = Array.from(checked).map(member => member.value);

    fetch(`/restore_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        logSuccess("Restauration de membres", data);
        getMembers();
        getDeletedMembers();
    })
    .catch(error => logError("restoreMembers", error));
});
