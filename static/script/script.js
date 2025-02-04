// Fonction générique pour afficher les erreurs
function logError(context, error) {
    console.error(`[Erreur - ${context}]`, error);
}

// Fonction générique pour afficher les succès
function logSuccess(context, message) {
    console.log(`[Succès - ${context}]`, message);
}