import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { DOMParser } from "xmldom";

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
const convertirEnXML = (listeCocktails) => {
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

const parseXml = (data) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    return xmlDoc;
}
// ROUTES
// Récupérer la liste des cocktails en XML
app.get("/liste", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res
          .status(500)
          .send("<erreur>Erreur lors de la lecture du fichier</erreur>");
      }
  
      res.setHeader("Content-Type", "application/xml");
      res.send(data); // Envoie directement le XML lu
    });
  });
  
  // Route pour ajouter un cocktail
  app.post("/liste", async (req, res) => {
    try {
      const cocktail = req.body;
      console.log(cocktail);
      
      // Lire le fichier XML existant
      const donneesXML = await fs.promises.readFile(filePath, "utf8");
  
      // Convertir l'ancien XML en objets JS
      const xmlDoc = parseXml(donneesXML);
      const cocktails = [...xmlDoc.getElementsByTagName("cocktail")].map((node) => ({
        id: node.getElementsByTagName("id")[0]?.textContent,
        nom: node.getElementsByTagName("nom")[0]?.textContent,
        type: node.getElementsByTagName("type")[0]?.textContent,
        prix: node.getElementsByTagName("prix")[0]?.textContent,
        image: node.getElementsByTagName("image")[0]?.textContent,
        ingredients: [...node.getElementsByTagName("ingredients")].map((ing) => ing.textContent),
      }));
  
      cocktails.push(cocktail);
  
      const xmlFinal = convertirEnXML(cocktails);
  
      // Écrire le fichier XML mis à jour
      await fs.promises.writeFile(filePath, xmlFinal, { encoding: "utf8" });
  
      res.setHeader("Content-Type", "application/xml");
      res.status(201).send("<message>Cocktail ajouté avec succès</message>");
    } catch (error) {
      console.error("Erreur lors de l'ajout du cocktail :", error.message);
      res
        .status(500)
        .send("<erreur>Erreur lors de l'ajout du cocktail</erreur>");
    }
  });
  
// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
