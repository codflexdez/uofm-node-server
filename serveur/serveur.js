import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { DOMParser,  XMLSerializer } from "xmldom";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const fichierCourrant = fileURLToPath(import.meta.url);
const dirPath = path.dirname(fichierCourrant);
const filePath = path.join(dirPath, "donnees", "cocktails.xml");


// Middleware pour les fichiers statiques
app.use(express.static(path.join(dirPath, "../client")));



// Mise à jour des nœuds XML correspondant à chaque propriété de l'objet JavaScript cocktail.
const processCocktailProperties = (xmlDoc, cocktailNode, cocktailData) => {
  Object.entries(cocktailData).forEach(([key, value]) => {
    if (key === "ingredients") {
      // Traitement des ingrédients
      Array.from(cocktailNode.getElementsByTagName("ingredients")).forEach(node => 
        cocktailNode.removeChild(node)
      );
      value.forEach(ingredient => {
        const ingredientNode = xmlDoc.createElement("ingredients");
        ingredientNode.textContent = ingredient;
        cocktailNode.appendChild(ingredientNode);
      });
    } else {
      // Mise à jour des autre propriétés
      const existingNode = cocktailNode.getElementsByTagName(key)[0];
      if (existingNode) {
        existingNode.textContent = value;
      } else {
        const nNode = xmlDoc.createElement(key);
        nNode.textContent = value;
        cocktailNode.appendChild(nNode);
      }
    }
  });
};


// Lecture du fichier XML
const readXmlFile = async () => {
  const donneesXML = await fs.promises.readFile(filePath, "utf8");
  return parseXml(donneesXML);
};

// Écriture des données XML modifiées dans le fichier
const writeXmlFile = async (xmlDoc) => {
  const serializer = new XMLSerializer();
  const xmlFinal = serializer.serializeToString(xmlDoc);
  await fs.promises.writeFile(filePath, xmlFinal, { encoding: "utf8" });
};

// Trouver le cocktail par ID dans le document XML
const trouverCocktail = (xmlDoc, id) => {
  const cocktailsXml = Array.from(xmlDoc.getElementsByTagName("cocktail"));
  return cocktailsXml.find(cocktail => 
    cocktail.getElementsByTagName("id")[0]?.textContent === id
  );
};

// Transformation d'une chaîne XML en un Document XML
const parseXml = (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "application/xml");
  return xmlDoc;
};



// ROUTES
// Récupérer la liste des cocktails en XML
app.get("/liste", async (req, res) => {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    res.setHeader("Content-Type", "application/xml");
    res.send(data);
  } catch (error) {
    res.status(500).send({ msg: "Erreur lors de la lecture du fichier" });
  }
});


// Route pour ajouter un cocktail
app.post("/liste", async (req, res) => {
  try {
    const cocktail = req.body;
    const xmlDoc = await readXmlFile();
    const root = xmlDoc.getElementsByTagName("listeCocktails")[0];
    
    const cocktailNode = xmlDoc.createElement("cocktail");
    processCocktailProperties(xmlDoc, cocktailNode, cocktail);  // Use the helper function

    root.appendChild(cocktailNode);
    await writeXmlFile(xmlDoc);

    res.status(201).json({ msg: "Cocktail ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du cocktail :", error.message);
    res.status(500).send({ error: "Erreur lors de l'ajout du cocktail", details: error.message });
  }
});


// Route pour mettre à jour un cocktail
app.put("/liste/:id", async (req, res) => {
  try {
    const cocktailId = req.params.id;
    console.log(typeof cocktailId);
    
    const cocktailMod = req.body;
    const xmlDoc = await readXmlFile();

    const targetCocktail = trouverCocktail(xmlDoc, cocktailId);

    if (!targetCocktail) {
      return res.status(404).json({ msg: "Cocktail non trouvé" });
    }

    processCocktailProperties(xmlDoc, targetCocktail, cocktailMod);  // Use the helper function

    await writeXmlFile(xmlDoc);
    res.status(200).json({ msg: "Cocktail mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du cocktail :", error.message);
    res.status(500).json({ msg: "Erreur lors de la mise à jour du cocktail", details: error.message });
  }
});



// Route pour supprimer un cocktail
app.delete("/liste/:id", async (req, res) => {
  const cocktailId = req.params.id;

  try {
    const xmlDoc = await readXmlFile();
    const root = xmlDoc.getElementsByTagName("listeCocktails")[0];
    const targetCocktail = trouverCocktail(xmlDoc, cocktailId);

    if (!targetCocktail) {
      return res.status(404).json({ error: "Cocktail non trouvé" });
    }

    root.removeChild(targetCocktail);
    await writeXmlFile(xmlDoc);

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
