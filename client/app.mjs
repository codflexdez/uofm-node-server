import { afficherListeParPage } from "./views/affichage.mjs";
import { afficherToast } from "./views/notifications.mjs";
import { ouvrirModaleAjouter, ouvrirModaleModifier } from "./views/modale.mjs";
import { formValidation } from "./modules/validation.mjs";
import {
  chargerCocktailsFETCH,
  modifier,
  ajouter,
  supprimer,
} from "./controller/cocktailController.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  const modalBtn = document.querySelector("#btnAjouter");
  const cocktailsContainer = document.querySelector("#container_cocktails");
  const btnEnreg = document.querySelector("#btnEnreg");
  const msgForm = document.querySelector("#msgForm");

  // menu principale
  const objOptions = {
    tri: document.querySelector("#tri"),
    btnRecherche: document.querySelector("#btnRecherch"),
    rechercheCritere: document.querySelector("#filtre"),
    champRecherche: document.querySelector("input[aria-label='Recherche']"),
  };

  const { tri, btnRecherche, rechercheCritere, champRecherche } = objOptions;

  // les champs de formulair
  const champsForm = {
    nom: document.querySelector("#nom"),
    type: document.querySelector("#type"),
    prix: document.querySelector("#prix"),
    image: document.querySelector("#image"),
    ingredients: document.querySelector("#ingredients"),
  };
  let liste = await chargerCocktailsFETCH();
  afficherListeParPage(liste);

  // Gestion du bouton Ajouter
  modalBtn.addEventListener("click", ouvrirModaleAjouter);
  btnEnreg.addEventListener("click", () =>
    handleAjouterOuModifier(champsForm, liste, msgForm)
  );
  cocktailsContainer.addEventListener("click", (e) =>
    actionsSupprimerOuModifier(e)
  );

  // Tri, recherche, et filtre
  tri.addEventListener("change", () => mettreAJourUI(liste, objOptions));
  btnRecherche.addEventListener("click", () =>
    mettreAJourUI(liste, objOptions)
  );
  rechercheCritere.addEventListener("change", () =>
    mettreAJourUI(liste, objOptions)
  );
  champRecherche.addEventListener("input", () =>
    mettreAJourUI(liste, objOptions)
  );
});

const handleAjouterOuModifier = async (champsForm, liste, msgForm) => {
  const { nom, type, prix, image, ingredients } = champsForm;

  const dataForm = {
    nom: nom.value.trim(),
    type: type.value.trim(),
    prix: parseFloat(prix.value),
    ingredients: Array.from(ingredients.selectedOptions).map(
      (option) => option.value
    ),
    image: image.value.trim(),
  };

  const { estValide, msgErreur } = formValidation(dataForm); // validation de formulaire
  if (!estValide) {
    msgForm.innerHTML = "";
    msgErreur.forEach((err) => {
      msgForm.innerHTML += `<div class="error-message">${err.msg}</div>`;
    });
    return false;
  }
  msgForm.innerHTML = "";

  const cocktailId = image.dataset.id 
  ? parseInt(image.dataset.id) 
  : Math.max(...liste.map((cocktail) => cocktail.id), 0) + 1;

  // Ajouter ou mettre à jour le cocktail
  const cocktail = { id: cocktailId, ...dataForm };
  const response = image.dataset.id 
    ? await modifier(cocktailId, cocktail)
    : await ajouter(cocktail);
 

  if (response.msg.includes("succès")) {
    // Fournir des commentaires et mettre à jour la liste
    msgForm.innerHTML = response.msg;
    
    liste = await chargerCocktailsFETCH();
    afficherListeParPage(liste);
    return true;
  } else {
    msgForm.innerHTML = "Une erreur s'est produite. Veuillez réessayer.";
    return false;
  }
};


const actionsSupprimerOuModifier = async (e) => {
  let target = e.target; // Gestion des boutons Modifier et Supprimer
  let cocktailId = target.dataset.id;
  let liste = await chargerCocktailsFETCH();

  if (e.target.classList.contains("bi-pencil")) {
    console.log("id:", cocktailId, typeof cocktailId);
    
    
    const cocktail = liste.find((item) => +item.id === +cocktailId);
    console.log(cocktail);

    if (cocktail) ouvrirModaleModifier(cocktail);
  } else if (e.target.classList.contains("bi-trash")) {
    afficherToast(
      "Êtes-vous sûr de vouloir supprimer cet élément ?",
      "warning",
      "Confirmation",
      true,
      async () => {
        console.log(typeof cocktailId);
        let response = await supprimer(cocktailId);

        if (response.msg.includes("succès")) {
          let uListe = liste.filter((cocktail) => cocktail.id !== cocktailId);
          afficherListeParPage(uListe);
        } else {
          msgForm.innerHTML = response.msg;
        }
      }
    );
  }
};


// Met à jour l'affichage avec les options de tri, recherche et filtre
const mettreAJourUI = (liste, objOptions) => {
  // Use the already declared references
  const { tri, rechercheCritere, champRecherche } = objOptions;
  const triCritere = tri?.value.toLowerCase();
  const critere = rechercheCritere?.value.toLowerCase();
  const rechercheTerme = champRecherche?.value.toLowerCase();

  let listeFiltre = liste;

  // Appliquer le filtre
  if (critere && critere !== "filtrer selon") {
    listeFiltre = listeFiltre.filter((cocktail) =>
      cocktail.type?.toLowerCase().includes(critere)
    );
  }
  // Appliquer la recherche
  if (rechercheTerme) {
    listeFiltre = listeFiltre.filter((cocktail) => {
      return (
        cocktail.nom?.toLowerCase().includes(rechercheTerme) ||
        cocktail.prix?.toString().includes(rechercheTerme) ||
        cocktail.ingredients?.some((ing) =>
          ing.toLowerCase().includes(rechercheTerme)
        )
      );
    });
  }
  // Appliquer le tri
  if (triCritere && triCritere !== "trier par") {
    listeFiltre.sort((a, b) => {
      if (triCritere === "id") return a.id - b.id;
      if (triCritere === "nom") return a.nom?.localeCompare(b.nom);
      if (triCritere === "prix") {
        return a.prix - b.prix;
      }
      if (triCritere === "type") return a.type?.localeCompare(b.type);
      return 0;
    });
  }
  afficherListeParPage(listeFiltre); // Mettre à jour l'affichage
};
