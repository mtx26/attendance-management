getMembers();
getPresence();

const addMemberButton = document.getElementById("add-member-button");
const memberInput = document.getElementById("member-input");
const submitButton = document.getElementById("submit-button");
const deleteMemberButton = document.getElementById("delete-member-button");
const deletePresenceButton = document.getElementById("delete-presence-button");

setInterval(getPresence, 60000); // Actualiser la présence toutes les minutes

// Fonction pour récupérer les membres depuis Flask
function getMembers(){
    const membersList = document.getElementById("members-list");

    
    fetch("http://0.0.0.0:10000/members")
        .then(response => response.json())  
        .then(data => {
            console.log("Membres récupérés :", data); 

            
            membersList.innerHTML = "";

            
            data.forEach(member => {
                let li = document.createElement("li");
                let input = document.createElement("input");
                let label = document.createElement("label");

                input.id = member;
                input.type = "checkbox";
                input.value = member;
                input.classList.add("member-checkbox");

                label.htmlFor = member;
                label.textContent = member;

                li.appendChild(input);
                li.appendChild(label);
                membersList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des membres (members js):", error);
        });
}

// Ajoute les membres présents
submitButton.addEventListener("click", () => {
    const checked = document.querySelectorAll("input[type='checkbox'][class~='member-checkbox']:checked");
    const selectedMembers = []; // Tableau pour stocker les membres cochés

    checked.forEach(member => {
        selectedMembers.push(member.value); // Ajouter le nom au tableau
    });

    fetch("http://0.0.0.0:10000/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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

// Ajoute un membre
addMemberButton.addEventListener("click", () => {
    const newMember = memberInput.value;
    newMembers = [newMember];
    console.log("Nouveau membre :", newMembers);

    fetch("http://0.0.0.0:10000/add_members", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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


    memberInput.value = ""; // Effacer le champ de saisie

});

// Supprime les membres sélectionnés
deleteMemberButton.addEventListener("click", () => {
    if(!window.confirm("Voulez-vous vraiment supprimer les membres sélectionnés ?")) return;
    const checked = document.querySelectorAll("input[type='checkbox'][class~='member-checkbox']:checked");
    const selectedMembers = [];

    checked.forEach(member => {
        selectedMembers.push(member.value);
    });

    fetch("http://0.0.0.0:10000/delete_members", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ members: selectedMembers })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        getMembers();
        getPresence();
    })
    .catch(error => {
        console.error("Error (delete_member js):", error);
    });
});

// Fonction pour récupérer les membres présents
function getPresence() {
    fetch("http://0.0.0.0:10000/presences")  
        .then(response => response.json())
        .then(data => {
            console.log("Présence :", data);
            const presenceList = document.getElementById("presence-list");
            presenceList.innerHTML = "";
            data.forEach(member => {
                let li = document.createElement("li");
                let input = document.createElement("input");
                let label = document.createElement("label");

                input.id = member + "-presence";
                input.type = "checkbox";
                input.value = member;
                input.classList.add("presence-checkbox");

                label.htmlFor = member + "-presence";
                label.textContent = member;

                li.appendChild(input);
                li.appendChild(label);
                presenceList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error (presence js):", error);
        });
}

// Supprime les membres présents
deletePresenceButton.addEventListener("click", () => {
    if(!window.confirm("Voulez-vous vraiment supprimer la présence des membres sélectionnés ?")) return;
    const checked = document.querySelectorAll("input[type='checkbox'][class~='presence-checkbox']:checked");
    const selectedMembers = [];

    checked.forEach(member => {
        selectedMembers.push(member.value);
    });

    fetch("http://0.0.0.0:10000/delete_presences", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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