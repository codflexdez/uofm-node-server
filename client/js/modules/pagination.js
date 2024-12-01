// Fonction pour afficher la page courante
export function afficherPage(liste, page, itemsPerPage, afficherListe) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = liste.slice(startIndex, endIndex);
    afficherListe(pageItems); // Appel de la fonction pour afficher les éléments
}

// Fonction pour générer les boutons de pagination
export function genererPagination(liste, itemsPerPage, afficherPage, afficherListe, currentPage) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Vider le contenu actuel

    const pageCount = Math.ceil(liste.length / itemsPerPage); // Calculer le nombre de pages
    const maxButtons = 5; // Nombre maximum de boutons à afficher en même temps

    // Bouton pour aller à la première page <<
    const firstButton = document.createElement('button');
    firstButton.innerHTML = '<i class="bi bi-chevron-double-left"></i>';
    firstButton.classList.add('btn', 'btn-outline-primary', 'me-2');
    firstButton.addEventListener('click', () => {
        afficherPage(liste, 1, itemsPerPage, afficherListe);
        genererPagination(liste, itemsPerPage, afficherPage, afficherListe, 1); // Met à jour la pagination
    });
    pagination.appendChild(firstButton);

    // Générer les boutons de pages
    let startPage = Math.max(currentPage - Math.floor(maxButtons / 2), 1);
    let endPage = Math.min(startPage + maxButtons - 1, pageCount);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(endPage - maxButtons + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('btn', 'btn-outline-primary', 'me-2');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            afficherPage(liste, i, itemsPerPage, afficherListe);
            genererPagination(liste, itemsPerPage, afficherPage, afficherListe, i); // Met à jour la pagination
        });
        pagination.appendChild(button);
    }

    // Ajouter des ellipses si nécessaire
    if (endPage < pageCount) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('me-2');
        pagination.appendChild(ellipsis);
    }

    // Bouton pour aller à la dernière page >>
    const lastButton = document.createElement('button');
    lastButton.innerHTML = '<i class="bi bi-chevron-double-right"></i>';
    lastButton.classList.add('btn', 'btn-outline-primary', 'me-2');
    lastButton.addEventListener('click', () => {
        afficherPage(liste, pageCount, itemsPerPage, afficherListe);
        genererPagination(liste, itemsPerPage, afficherPage, afficherListe, pageCount); // Met à jour la pagination
    });
    pagination.appendChild(lastButton);
}
