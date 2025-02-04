const deleteMembersList = document.getElementById("delete-members-list");
const RestoreMemberButton = document.getElementById("restore-member-button");

getDeletedMembers();
setInterval(getDeletedMembers, 60000);

// Restaure les membres sélectionnés
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
        getDeletedMembers();
    })
    .catch(error => logError("restoreMembers", error));
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
            
                let div = document.createElement("div");
                div.classList.add("form-check");
            
                let input = document.createElement("input");
                let label = document.createElement("label");
            
                input.id = member + "-delete";
                input.type = "checkbox";
                input.value = member;
                input.classList.add("form-check-input", "me-2", "delete-checkbox");
            
                label.setAttribute("for", member + "-delete"); // Associe correctement le label
                label.textContent = member;
                label.classList.add("form-check-label");
            
                div.appendChild(input);
                div.appendChild(label);
                li.appendChild(div);
                deleteMembersList.appendChild(li);
            
                // Correction : Permet au label de fonctionner normalement
                label.addEventListener("click", (event) => {
                    event.stopPropagation(); // Empêche l'écouteur de <li> de prendre le dessus
                });
            });
            // Ajoute un gestionnaire pour rendre toute la ligne cliquable
            deleteMembersList.addEventListener("click", (event) => {
                let li = event.target.closest(".list-group-item");
                if (!li) return;

                let checkbox = li.querySelector(".delete-checkbox");
                if (checkbox && event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            }); 
        })
        .catch(error => logError("getDeletedMembers", error));
}
