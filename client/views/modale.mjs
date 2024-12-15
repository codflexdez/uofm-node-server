// Ouvrir la modale pour ajouter un nouvel élément
const modal = new bootstrap.Modal(document.getElementById("modal"));
const titreModal = document.querySelector("#modalLabel");
const image = document.querySelector("#image");
const nom = document.querySelector("#nom");
const type = document.querySelector("#type");
const prix = document.querySelector("#prix");
const ingredients = document.querySelector("#ingredients");

export const ouvrirModaleAjouter = () => {
  titreModal.innerHTML = "Ajouter un Cocktail";

  reinitialiserLesChamps();

  modal.show();
};

export const ouvrirModaleModifier = (cocktail) => {
 console.log(cocktail);
 
  titreModal.innerHTML = "Modifier le Cocktail";

  nom.value = cocktail.nom;
  type.value = cocktail.type;
  prix.value = cocktail.prix;
  image.dataset.id = cocktail.id;
  image.value = cocktail.image;
 

  montrerIngredients(cocktail.ingredients);
 
  modal.show();
};

const montrerIngredients = (ingredientsAmontrer) => {
  const currentOptions = Array.from(ingredients.options).map(
    (opt) => opt.value
  );

  // Ajouter les ingredients du cocktail à modifier
  ingredientsAmontrer.forEach((ingredient) => {
    if (!currentOptions.includes(ingredient)) {
      const option = document.createElement("option");
      option.value = ingredient;
      option.textContent = ingredient;
      ingredients.appendChild(option);
    }
  });

  // Selectioner les ingridients du cocktail à modifier
  Array.from(ingredients.options).forEach((option) => {
    option.selected = ingredientsAmontrer.includes(option.value);
  });
};

const reinitialiserLesChamps = () => {
  nom.value = "";
  type.value = "";
  prix.value = "";
  ingredients.selectedIndex = -1;
  image.value = "";
  image.removeAttribute("data-id");
};
