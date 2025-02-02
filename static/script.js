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

// Récupère la liste des membres
function getMembers(){
    const membersList = document.getElementById("members-list");

    fetch(`/members`)
        .then(response => response.json())  
        .then(data => {
            console.log("Membres récupérés :", data); 
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
        .catch(error => {
            console.error("Erreur lors de la récupération des membres (members js):", error);
        });
}

// Récupère la liste des présences
function getPresence() {
    fetch(`/presences`)  
        .then(response => response.json())
        .then(data => {
            console.log("Présence :", data);
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
        .catch(error => {
            console.error("Error (presence js):", error);
        });
}

// Ajoute un membre
addMemberButton.addEventListener("click", () => {
    const newMember = memberInput.value;
    newMembers = [newMember];

    fetch(`/add_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member: newMembers })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getMembers();
    })
    .catch(error => {
        console.error("Member addition error (add_members js):", error);
    });

    memberInput.value = "";
});

// Ajoute les membres présents
submitButton.addEventListener("click", () => {
    const checked = document.querySelectorAll("input[type='checkbox'][class~='member-checkbox']:checked");
    const selectedMembers = [];

    checked.forEach(member => {
        selectedMembers.push(member.value);
    });

    fetch(`/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getPresence();
    })
    .catch(error => {
        console.error("Error (submit js):", error);
    });
});

// Supprime les membres sélectionnés
deleteMemberButton.addEventListener("click", () => {
    if(!window.confirm("Voulez-vous vraiment supprimer les membres sélectionnés ?")) return;
    const checked = document.querySelectorAll("input[type='checkbox'][class~='member-checkbox']:checked");
    const selectedMembers = [];

    checked.forEach(member => {
        selectedMembers.push(member.value);
    });

    fetch(`/delete_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getMembers();
        getPresence();
        getDeletedMembers();
    })
    .catch(error => {
        console.error("Error (delete_member js):", error);
    });
});

// Supprime les membres présents
deletePresenceButton.addEventListener("click", () => {
    if(!window.confirm("Voulez-vous vraiment supprimer la présence des membres sélectionnés ?")) return;
    const checked = document.querySelectorAll("input[type='checkbox'][class~='presence-checkbox']:checked");
    const selectedMembers = [];

    checked.forEach(member => {
        selectedMembers.push(member.value);
    });

    fetch(`/delete_presences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getPresence();
    })
    .catch(error => {
        console.error("Error (delete_presence js):", error);
    });
});

// Récupère les membres supprimés
// Récupère les membres supprimés
function getDeletedMembers() {
    fetch(`/deleted_members`)  
        .then(response => response.json())
        .then(data => {
            console.log("Membres supprimés :", data);
            const deleteMembersList = document.getElementById("delete-members-list");
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
        .catch(error => {
            console.error("Error (deleted_members js):", error);
        });
}


RestoreMemberButton.addEventListener("click", () => {
    if(!window.confirm("Voulez-vous vraiment restaurer les membres sélectionnés ?")) return;
    const checked = document.querySelectorAll("input[type='checkbox'][class~='delete-checkbox']:checked");
    const selectedMembers = [];

    checked.forEach(member => {
        selectedMembers.push(member.value);
    });

    fetch(`/restore_members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);
        getMembers();
        getDeletedMembers();
    })
    .catch(error => {
        console.error("Error (restore_members js):", error);
    });
});