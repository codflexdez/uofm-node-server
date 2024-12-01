import { afficherListeParPage } from "./views/affichage.mjs";
import { afficherToast } from "./views/notifications.mjs";
import { ouvrirModaleAjouter, ouvrirModaleModifier } from "./views/modale.mjs";
import { chargerCocktailsFETCH, modifier, ajouter, supprimer } from "./controller/cocktailController.mjs";
import { formValidation } from "./modules/validation.mjs";

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
    champRecherche: document.querySelector(
      "input[aria-label='Recherche']"
    )
  };
   
  const {tri, btnRecherche, rechercheCritere, champRecherche} = objOptions;

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
    actionsSupprimerOuModifier(e, liste)
  );

  // Tri, recherche, et filtre
  tri.addEventListener("change", () => mettreAJourUI(liste, objOptions));
  btnRecherche.addEventListener("click", () => mettreAJourUI(liste, objOptions));
  rechercheCritere.addEventListener("change", () => mettreAJourUI(liste, objOptions));
  champRecherche.addEventListener("input", () => mettreAJourUI(liste, objOptions));
});

// Met à jour l'affichage avec les options de tri, recherche et filtre
const mettreAJourUI = (liste, objOptions) => {
  // Use the already declared references
  const {tri, rechercheCritere, champRecherche} = objOptions;
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

  const { estValide, msgErreur } = formValidation(dataForm);      // validation de formulaire
  if (!estValide) {
    msgForm.innerHTML = "";
    msgErreur.forEach((err) => {
      msgForm.innerHTML += `<div class="error-message">${err.msg}</div>`;
    });
    return false;
  }
  msgForm.innerHTML = "";

  // Déterminer si l'ajout ou la modification
  const isEditing = !!image.dataset.id;
  const cocktailId = isEditing ? parseInt(image.dataset.id) :  Math.max(...liste.map(cocktail => cocktail.id), 0) + 1;

  // Ajouter ou mettre à jour le cocktail
  const cocktail = { id: cocktailId, ...dataForm };
  const response = isEditing
    ? await modifier(cocktailId, cocktail)
    : await ajouter(cocktail);

  if (response.msg.includes("succes")) {      // Fournir des commentaires et mettre à jour la liste
    msgForm.innerHTML = response.msg;
    if (isEditing) {                          // Modifier cocktail
      mettreAjourCocktails(cocktail, liste);
    } else {                                  // Ajouter un nouveau cocktail
      cocktail.id = cocktailId; 
      liste.push(cocktail);
      afficherListeParPage(liste);
    }
    return true;
  } else {
    msgForm.innerHTML = "Une erreur s'est produite. Veuillez réessayer.";
    return false;
  }
};

const mettreAjourCocktails = (cocktail, liste) => {
  const index = liste.findIndex((item) => item.id === cocktail.id);
  if (index !== -1) {
    liste[index] = { ...cocktail };
    afficherListeParPage(liste);
  }
};

const actionsSupprimerOuModifier = (e, liste) => {       
  let target = e.target;   // Gestion des boutons Modifier et Supprimer
  let cocktailId = parseInt(target.dataset.id);

  if (e.target.classList.contains("bi-pencil")) {
   
    const cocktail = liste.find((item) => +item.id === cocktailId);

    ouvrirModaleModifier(cocktail);

  } else if (e.target.classList.contains("bi-trash")) {
    afficherToast(                                        // Récupérer l'ID de l'élément à supprimer
      "Êtes-vous sûr de vouloir supprimer cet élément ?", // Message
      "warning",                                          // Type (warning pour avertissement)
      "Confirmation",                                     // Titre
      true,                                               // Avec confirmation (true)
      async () => {
        const response = await supprimer(cocktailId);     // Fonction callback pour confirmer la suppression
        if (response.msg.includes("succes")) {
          liste = response.liste;                         // Mettre à jour la liste avec les données du serveur
          afficherListeParPage(liste);                    // Mise à jour de l'affichage
        } else {
          msgForm.innerHTML = response.msg;
        }
      }
    );
  }
};