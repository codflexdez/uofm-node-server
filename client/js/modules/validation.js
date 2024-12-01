const formValidation = ({ nom, type, prix, image }) => {
  let estValide = true;
  let msgErreur = [];


    
  const champInvalid = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add("invalid");
    }
    msgErreur.push({ field: fieldId, msg: message });
    estValide = false;
  };

  // Helper to mark a field valid (reset state)
  const reinitChamp = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("invalid");
    }
  };

  // Validation de nom
  if (nom === "") {
    champInvalid("nom", "Le nom du cocktail est requis.");
  } else if (nom.length > 25) {
    champInvalid("nom", "Le nom du cocktail ne doit pas dépasser 25 caractères.");
  } else if (!/^[a-zA-Z0-9\s]+$/.test(nom)) {
    champInvalid("nom", "Le nom du cocktail ne doit pas contenir de caractères spéciaux.");
  } else {
    reinitChamp("nom");
  }
  // Validation de type
  if (typeof type !== "string" || type === "") {
    champInvalid("type", "Le type du cocktail est requis.");
  } else {
    reinitChamp("type");
  }
  // Validation de prix
  if (isNaN(prix) || prix <= 0) {
    champInvalid("prix", "Le prix doit être un nombre valide et supérieur à zéro.");
  } else {
    reinitChamp("prix");
  }
//   Validation de image
  if (typeof image !== "string" || image === "") {
    champInvalid("image", "Veuillez insérer un URL de l'image.");
  } else {
    reinitChamp("image");
  }
  


  return {estValide, msgErreur};
};

export { formValidation };
