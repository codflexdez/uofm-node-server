export const afficherToast = (message, type = 'info', titre = 'Notification', avecConfirmation = false, callbackConfirmation = null) => {
    const toastElement = document.getElementById('toastMessage');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const btnConfirmer = document.getElementById('btnConfirmer'); 
    const btnAnnuler = document.getElementById('btnAnnuler');

    // Modifier le contenu du message uniquement, sans toucher aux boutons
    messageContent.textContent = message;

    // Modifier le titre du toast
    toastTitle.textContent = titre;

    // Appliquer un style différent en fonction du type de message
    if (type === 'success') {
        toastElement.classList.remove('bg-danger', 'bg-warning', 'bg-info');
        toastElement.classList.add('bg-success', 'text-white');
    } else if (type === 'error') {
        toastElement.classList.remove('bg-success', 'bg-warning', 'bg-info');
        toastElement.classList.add('bg-danger', 'text-white');
    } else if (type === 'warning') {
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-info');
        toastElement.classList.add('bg-warning', 'text-dark');
    } else {
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning');
        toastElement.classList.add('bg-info', 'text-white');
    }

    // Gérer l'affichage des boutons de confirmation
    if (avecConfirmation) { // Si une confirmation est nécessaire
     
        // Montrer les boutons de confirmation-annulation
        btnConfirmer.style.display = 'inline-block';
        btnAnnuler.style.display = 'inline-block';

        // Ajouter un gestionnaire d'événements pour confirmer l'action
        btnConfirmer.onclick = () => {
            if (callbackConfirmation) callbackConfirmation(); // Appelle la fonction de confirmation si définie
            hideToast(); // Cacher le toast après confirmation
        };

        // Cacher le toast si l'utilisateur annule
        btnAnnuler.onclick = hideToast;

    } else {
        // Cacher les boutons si aucune confirmation n'est nécessaire
        btnConfirmer.style.display = 'none';
        btnAnnuler.style.display = 'none';
    }

    // Afficher le toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
};

// Fonction pour cacher le toast
export const hideToast = () => {
    const toastElement = document.getElementById('toastMessage');
    const toast = new bootstrap.Toast(toastElement);
    toast.hide();
};
