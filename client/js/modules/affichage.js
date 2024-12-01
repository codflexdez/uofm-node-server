import { afficherPage, genererPagination } from './pagination.js'


const ficheCocktail = (cocktail) => {
  // Fonction pour afficher la liste des cocktails dans le DOM avec alternance de couleur de fond
  let i = cocktail.id;
  const cardColor = cocktail.id % 2 === 0 ? " card-color" : "";
  return `
  <div class="card mb-3 ${cardColor}">
    <div class="d-flex flex-wrap align-items-center gap-1">
      
      <img src="${cocktail.image}" class="img img-fluid rounded-start"  alt="${cocktail.nom}-${i}" />
    
      <div class="card-body">
        <h5 class="card-title">${cocktail.nom}</h5>
        <p class="card-text">Type: ${cocktail.type}</p>
        <p class="card-text">Prix: ${cocktail.prix} €</p>
        <p class="card-text ingredients"><strong>Ingrédients:</strong> ${cocktail.ingredients.join(', ')}</p>
      </div>
      <div class="buttons">
        <button class="btn btn-outline-primary btn-modifier" data-id="${i}">
            <i class="bi bi-pencil" data-id="${i}"></i>
        </button>
        <button class="btn btn-outline-danger btn-supprimer" data-id="${i}">
            <i class="bi bi-trash" data-id="${i}"></i>
        </button>
      </div>
    </div>
  </div>`;  
};



const afficherCocktails = (cocktailsParPage) => {
  const page = document.getElementById("container_cocktails");
  let listeCards = "";
  cocktailsParPage.forEach((cocktail) => {
    listeCards += ficheCocktail(cocktail);
  });
  page.innerHTML = listeCards;
};


const afficherListeParPage = (liste) => { 
  
  // Pagination
  const itemsPerPage = 4;
  let currentPage = 1;
 
 afficherPage(liste, currentPage, itemsPerPage, afficherCocktails);
  
 genererPagination(liste, itemsPerPage, afficherPage, afficherCocktails, currentPage);

}


export { afficherListeParPage };



