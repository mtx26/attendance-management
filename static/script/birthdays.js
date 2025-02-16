document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/get_birthdays");
        const data = await response.json();

        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        let recentBirthdays = [];
        let upcomingBirthdays = [];
        let events = [];

        data.filter(member => member.birthday).forEach(member => {
            const birthdayDate = new Date(member.birthday);
            const birthYear = birthdayDate.getFullYear();
            const ageAtBirthday = today.getFullYear() - birthYear;

            // Calcul de la date d'anniversaire pour cette année
            let formattedDate = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
            const dateString = formattedDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

            // Vérifier si l'anniversaire était dans la dernière semaine
            const isRecentBirthday = formattedDate >= oneWeekAgo && formattedDate < today;

            // Ajouter dans les événements pour le calendrier
            events.push({
                title: `🎂 ${member.nom}`,
                start: dateString,
                extendedProps: { 
                    age: ageAtBirthday,
                    fullDate: birthdayDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
                },
                backgroundColor: isRecentBirthday ? "#FFA500" : (dateString.slice(5) === today.toISOString().slice(5, 10) ? "#DC3545" : "#1E3A8A"),
                textColor: "white",
            });

            // Création de l'élément pour la liste
            let li = document.createElement("li");
            li.classList.add("list-group-item");
            li.textContent = `🎂 ${member.nom} (${ageAtBirthday} ans) - ${birthdayDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}`;

            if (isRecentBirthday) {
                li.textContent += " (Anniversaire récent 🎉)";
                li.style.color = "#FFA500";
                recentBirthdays.push({ date: formattedDate, element: li });
            } else if (formattedDate >= today) {
                upcomingBirthdays.push({ date: formattedDate, element: li });
            }
        });

        // Trier les anniversaires récents (du plus ancien au plus récent)
        recentBirthdays.sort((a, b) => a.date - b.date);
        // Trier les anniversaires futurs (du plus proche au plus éloigné)
        upcomingBirthdays.sort((a, b) => a.date - b.date);

        // Nettoyer la liste et ajouter les anniversaires dans le bon ordre
        const listContainer = document.getElementById("birthday-list");
        listContainer.innerHTML = "";
        recentBirthdays.forEach(item => listContainer.appendChild(item.element));
        upcomingBirthdays.forEach(item => listContainer.appendChild(item.element));

        // Initialiser le calendrier FullCalendar avec tooltip au survol
        const calendarEl = document.getElementById("calendar");
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            locale: "fr",
            events: events,
            height: "auto",
            contentHeight: "auto",
            aspectRatio: 2,
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
            },
            buttonText: {
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour"
            },
            eventMouseEnter: function(info) { 
                let tooltip = document.createElement("div");
                tooltip.classList.add("custom-tooltip");
                tooltip.innerHTML = `<strong>${info.event.title}</strong><br>📅 ${info.event.extendedProps.fullDate}<br>🎉 ${info.event.extendedProps.age} ans`;
                document.body.appendChild(tooltip);

                tooltip.style.position = "absolute";
                tooltip.style.background = "#333";
                tooltip.style.color = "#fff";
                tooltip.style.padding = "8px";
                tooltip.style.borderRadius = "5px";
                tooltip.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";
                tooltip.style.pointerEvents = "none";
                tooltip.style.zIndex = "1000";

                function moveTooltip(e) {
                    tooltip.style.left = e.pageX + 10 + "px";
                    tooltip.style.top = e.pageY + 10 + "px";
                }

                document.addEventListener("mousemove", moveTooltip);

                info.el.addEventListener("mouseleave", () => {
                    tooltip.remove();
                    document.removeEventListener("mousemove", moveTooltip);
                });
            }
        });
        calendar.render();

        // Gestion du switch Liste/Calendrier
        document.getElementById("toggle-view").addEventListener("change", (event) => {
            const calendarContainer = document.getElementById("calendar-container");
            const listContainer = document.getElementById("list-container");
            const label = document.getElementById("toggle-label");

            if (event.target.checked) {
                calendarContainer.classList.remove("d-none");
                listContainer.classList.add("d-none");
                label.textContent = "Afficher Liste";
                setTimeout(() => calendar.updateSize(), 300);
            } else {
                calendarContainer.classList.add("d-none");
                listContainer.classList.remove("d-none");
                label.textContent = "Afficher Calendrier";
            }
        });

        // Par défaut : afficher la liste
        document.getElementById("toggle-view").checked = false;
        document.getElementById("calendar-container").classList.add("d-none");
        document.getElementById("list-container").classList.remove("d-none");
        document.getElementById("toggle-label").textContent = "Afficher Calendrier";

    } catch (error) {
        console.error("Erreur lors du chargement des anniversaires :", error);
    }
});