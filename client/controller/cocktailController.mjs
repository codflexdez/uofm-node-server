import { Cocktail } from "../models/Cocktail.mjs";

let creerObjetsListeCocktails = (listeCocktailsDOM) => {
    const listeObjetsCocktails = [];
    
    for (let unCocktailDOM of listeCocktailsDOM) {
  
      let id = unCocktailDOM.getElementsByTagName("id")[0]?.textContent.trim();
      let nom = unCocktailDOM.getElementsByTagName("nom")[0]?.textContent.trim();
      let type = unCocktailDOM.getElementsByTagName("type")[0]?.textContent.trim();
      let ingredients = Array.from(unCocktailDOM.getElementsByTagName("ingredients"))
        .map((ing) => ing.textContent.trim());
      let prix = unCocktailDOM.getElementsByTagName("prix")[0]?.textContent.trim();
      let image = unCocktailDOM.getElementsByTagName("image")[0]?.textContent.trim();
  
      // Créer un objet Cocktail
      let unCocktail = new Cocktail(id, nom, type, ingredients, prix, image);
      
      listeObjetsCocktails.push(unCocktail);
    }
  
    return listeObjetsCocktails;
  };
  

  export const chargerCocktailsFETCH = async () => {
    const url = "http://localhost:3000/liste"; 
    const options = {
      method: "GET",
    };
  
    try {
      let reponse = await fetch(url, options);
  
      if (reponse.ok) {
        const parser = new DOMParser();
        const reponseString = await reponse.text();
        const racineDOM = parser.parseFromString(reponseString, "application/xml");
      
    
        // Récupérer la liste des cocktails sous forme DOM
        const cocktailsDOM = racineDOM.getElementsByTagName("cocktail");
        
        const listeCocktails = creerObjetsListeCocktails(cocktailsDOM);
  
        console.log("Cocktails chargés :", listeCocktails);
        return listeCocktails;


      } else {
        console.error("Erreur lors de la récupération des cocktails");
        return [];
      }
    } catch (error) {
      console.error("Erreur réseau ou serveur :", error.message);
      return [];
    }
  };
  
  // Ajouter un élément
export const ajouter = async (cocktail) => {
  try {
      const url = "http://localhost:3000/liste";

      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
            },
          body: JSON.stringify(cocktail),
        });
        console.log('post fetch:',JSON.stringify(cocktail));

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erreur de l'enregistrement de cocktail: ${errorData.msg || 'Erreur inconnue'}`);
      }
     
      return response.json();
  } catch (error) {
      console.error("Erreur lors de l'ajout du cocktail:", error.message);
      return { msg : "Erreur d'enregistrement" };
  }
};


// Modifier un élément
export const modifier = async (id, element) => {
  try {
    
    const response = await fetch(`/liste/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(element),
    });
     
    if (!response.ok) {
      throw new Error(`Erreur lors de la modification de cocktail avec id: ${id}`);
    }

    const resultat = await response.json();
    console.log(response);
    return resultat; 
  } catch (error) {
    console.error("Erreur dans la fonction modifier:", error);
    return { msg : "Erreur d'enregistrement de cocktail modifé" };
  }
};


// Supprimer un élément
export const supprimer = async (id) => {
  console.log(id);
  
try {
  const response = await fetch(`/liste/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression de cocktail avec id: ${id}`);
  }

  const data = await response.json();
  console.log("Élément supprimé avec succès!");
  return data; 
} catch (error) {
  console.error("Erreur:", error.message);
  return { msg: error.message }; 
}
};