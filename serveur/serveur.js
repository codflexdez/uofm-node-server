import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { DOMParser,  XMLSerializer } from "xmldom";
import { Cocktail } from "../client/models/Cocktail.mjs";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const fichierCourrant = fileURLToPath(import.meta.url);
const dirPath = path.dirname(fichierCourrant);
const filePath = path.join(dirPath, "donnees", "cocktails.xml");


// Middleware pour les fichiers statiques
app.use(express.static(path.join(dirPath, "../client")));


// Convertir des objets JavaScript en XML
const oldConverter = (listeCocktails) => {
    const root = create({ version: "1.0" }).ele("listeCocktails");
  
    listeCocktails.forEach((cocktail) => {
      const cocktailNode = root.ele("cocktail");
      cocktailNode.ele("id").txt(cocktail.id);
      cocktailNode.ele("nom").txt(cocktail.nom);
      cocktailNode.ele("type").txt(cocktail.type);
      cocktailNode.ele("prix").txt(cocktail.prix);
      cocktailNode.ele("image").txt(cocktail.image);
  
      // Ajouter les ingrédients comme des éléments multiples
      cocktail.ingredients.forEach((ing) => {
        cocktailNode.ele("ingredients").txt(ing);
      });
    });
  
    return root.end({ prettyPrint: true });
  };


// ROUTES
// Récupérer la liste des cocktails en XML
app.get("/liste", (req, res) => {
  
  fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .send({msg : "Erreur lors de la lecture du fichier"});
      }
  
      res.setHeader("Content-Type", "application/xml");
      res.send(data); 
    });
  });



// Convertir des objets JavaScript en XML
const convertirEnXML = (xmlDoc) => {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
};

const parseXml = (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "application/xml");
  return xmlDoc;
};

// Route pour ajouter un cocktail
app.post("/liste", async (req, res) => {
  try {
    const cocktail = req.body;

    // Lire le fichier XML existant
    const donneesXML = await fs.promises.readFile(filePath, "utf8");

    // Convertir l'ancien XML en objets JS
    const xmlDoc = parseXml(donneesXML);

    // Get the root element
    const root = xmlDoc.getElementsByTagName("listeCocktails")[0];

    // Add new cocktail node
    const cocktailNode = xmlDoc.createElement("cocktail");

    // Map through cocktail properties and dynamically create child nodes
    Object.entries(cocktail).forEach(([key, value]) => {
      if (key === "ingredients") {
        // handle 'ingredients' as separate <ingredient> nodes
        value.forEach((ingredient) => {
          const ingredientNode = xmlDoc.createElement("ingredient");
          ingredientNode.textContent = ingredient;
          cocktailNode.appendChild(ingredientNode);
        });
      } else {
        // handle direct child nodes
        const childNode = xmlDoc.createElement(key);
        childNode.textContent = value;
        cocktailNode.appendChild(childNode);
      }
    });

    // Append the new cocktail node to the root
    root.appendChild(cocktailNode);

    // Convert the modified XML document back to string
    const xmlFinal = convertirEnXML(xmlDoc);

    // Write the updated XML back to the file
    await fs.promises.writeFile(filePath, xmlFinal, { encoding: "utf8" });

    res.setHeader("Content-Type", "application/json");
    res.status(201).send({ msg: "Cocktail ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du cocktail :", error.message);
    res.status(500).send({ error: "Erreur lors de l'ajout du cocktail", details: error.message });
  }
});

app.put("/liste/:id", async (req, res) =>{
  try {
    const cocktailId = req.params.id;
    const cocktailMod = req.body;

    const donneesXML = await fs.promises.readFile(filePath, "utf8");
    const xmlDoc = parseXml(donneesXML);

    
    const cocktailsXml = Array.from(xmlDoc.getElementsByTagName("cocktail"));
  
    const targetCocktail = cocktailsXml.find(cocktail => 
      cocktail.getElementsByTagName("id")[0]?.textContent === cocktailId
    );

    
    if (!targetCocktail) {
      return res.status(404).json({ msg: "Cocktail non trouvé" });
    }

    // Mettre à jour les propriétés du cocktail
    Object.entries(cocktailMod).forEach(([key, value]) => {
      if (key === "ingredients") {
        // Supprimer les anciens noeuds <ingredient> et ajouter les nouveaux
        Array.from(targetCocktail.getElementsByTagName("ingredient")).forEach(node => 
          targetCocktail.removeChild(node)
        );
        value.forEach(ingredient => {
          const ingredientNode = xmlDoc.createElement("ingredient");
          ingredientNode.textContent = ingredient;
          targetCocktail.appendChild(ingredientNode);
        });
      } else {
        // Mettre à jour ou ajouter les autres propriétés
        const existingNode = targetCocktail.getElementsByTagName(key)[0];
        if (existingNode) {
          existingNode.textContent = value;
        } else {
          const newNode = xmlDoc.createElement(key);
          newNode.textContent = value;
          targetCocktail.appendChild(newNode);
        }
      }
    });

    const xmlFinal = convertirEnXML(xmlDoc);
    await fs.promises.writeFile(filePath, xmlFinal, { encoding: "utf8" });
    res.status(200).json({ msg: "Cocktail mis à jour avec succès" });
  }
  catch (error) {
    console.error("Erreur lors de la mise à jour du cocktail :", error.message);
    res.status(500).json({ msg: "Erreur lors de la mise à jour du cocktail", details: error.message });

  }

});


app.delete("/liste/:id", async (req, res) => {
  const cocktailId = req.params.id;

  try {
    // Lire le fichier XML existant
    const donneesXML = await fs.promises.readFile(filePath, "utf8");
    const xmlDoc = parseXml(donneesXML);

    // Obtenir la liste des cocktails
    const root = xmlDoc.getElementsByTagName("listeCocktails")[0];
    const cocktails = Array.from(xmlDoc.getElementsByTagName("cocktail"));

    // Trouver le cocktail à supprimer
    const targetCocktail = cocktails.find(cocktail => 
      cocktail.getElementsByTagName("id")[0]?.textContent === cocktailId
    );
    
    if (!targetCocktail) {
      return res.status(404).json({ error: "Cocktail non trouvé" });
    }

    // Supprimer le cocktail du DOM
    root.removeChild(targetCocktail);

    // Convertir le document XML mis à jour en chaîne
    const xmlFinal = convertirEnXML(xmlDoc);
    
    // Écrire le fichier XML mis à jour
    await fs.promises.writeFile(filePath, xmlFinal, { encoding: "utf8" });

    res.status(200).json({ msg: "Cocktail supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du cocktail :", error.message);
    res.status(500).json({ error: "Erreur lors de la suppression du cocktail", details: error.message });
  }
});



  
// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
