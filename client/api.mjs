// Récupérer la liste des éléments
export const fetchListe = async () => {
    try {
        const response = await fetch('/liste');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const liste = await response.json();
        return liste;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
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
      return resultat; 
    } catch (error) {
      console.error("Erreur dans la fonction modifier:", error);
      return { msg : "Erreur d'enregistrement de cocktail modifé" };
    }
  };


// Supprimer un élément
export const supprimer = async (id) => {
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

