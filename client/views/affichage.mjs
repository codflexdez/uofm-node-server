import { afficherPage, genererPagination } from './pagination.mjs'

const ficheCocktail = (cocktail) => {
  const { id, nom, type, ingredients, prix, image } = cocktail;

  // Fonction pour afficher la liste des cocktails dans le DOM avec                             alternance de couleur de fond
  const cardColor = cocktail.id % 2 === 0 ? " card-color" : "";
  return `
  <div class="card mb-3 ${cardColor}">
    <div class="d-flex flex-wrap align-items-center gap-3 cbody">
      <img src="${image}" class="img img-fluid rounded-start"  alt="${nom}-${id}"/>
        <div class="d-flex flex-wrap align-items-center gap-3">
          <div class="d-flex flex-column mb-3">
              <h5 class="card-title">${nom}</h5>
              <p class="card-text"><span class="subtitle">Type:</span> ${type}</p>
              <p class="card-text"><span class="subtitle">Prix:</span> ${prix} €</p>
          </div>
          <div class="d-flex flex-column align-self-end">
            <h6 class="subtitle">Ingredients</h6>
            <p class="ingredients">${ingredients.join(", ")}</p>
          </div>
        </div> 
        <div class="buttons">
          <button class="btn btn-outline-primary btn-modifier" data-id="${id}">
              <i class="bi bi-pencil" data-id="${id}"></i>
          </button>
          <button class="btn btn-outline-danger btn-supprimer" data-id="${id}">
              <i class="bi bi-trash" data-id="${id}"></i>
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



