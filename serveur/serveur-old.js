import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { parseStringPromise, Builder } from "xml2js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const fichierCourrant = fileURLToPath(import.meta.url);
const dirPath = path.dirname(fichierCourrant);
const filePath = path.join(dirPath, "donnees", "cocktails.xml");

// Middleware pour les fichiers statiques
app.use(express.static(path.join(dirPath, "../client")));

let msg = "";

// Helper functions to handle XML
const readXmlFile = async () => {
  const data = await fs.promises.readFile(filePath, "utf8");
  return parseStringPromise(data);
};

const writeXmlFile = async (data) => {
  const builder = new Builder();
  const xml = builder.buildObject(data);
  await fs.promises.writeFile(filePath, xml, "utf8");
};

// ROUTES

// Get the list of cocktails
app.get("/liste", async (req, res) => {
  try {
    const data = await readXmlFile();
    res.json(data.listeCocktails.cocktail || []);
  } catch (err) {
    console.error("Erreur lors de la lecture du fichier XML:", err.message);
    res.status(500).json({ error: "Erreur lors de la lecture du fichier XML" });
  }
});


// Ajouter un nouveau cocktail
app.post("/liste", async (req, res) => {
  try {
    const newCocktail = req.body;
    const data = await readXmlFile();

    if (!data.listeCocktails.cocktail) {
      data.listeCocktails.cocktail = [];
    }

    // Assign a unique ID
   // newCocktail.id = String(new Date().getTime());
    data.listeCocktails.cocktail.push(newCocktail);

    await writeXmlFile(data);

    msg = `Le cocktail ${newCocktail.nom} a été ajouté avec succès`;
    res.json({ msg });
  } catch (err) {
    console.error("Erreur lors de l'ajout du cocktail:", err.message);
    res.status(500).json({ msg: "Problème pour enregistrer le cocktail." });
  }
});



// Update an existing cocktail by ID
app.put("/liste/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedCocktail = req.body;
    const data = await readXmlFile();
    const cocktails = data.listeCocktails.cocktail;

    const index = cocktails.findIndex((c) => c.id === id);

    if (index === -1) {
      msg = `Le cocktail n'a pas été trouvé`;
      return res.status(404).json({ msg });
    }

    cocktails[index] = { ...cocktails[index], ...updatedCocktail };

    await writeXmlFile(data);

    msg = `Le cocktail a été modifié avec succès`;
    res.status(200).json({ msg });
  } catch (err) {
    console.error("Error updating cocktail:", err.message);
    res.status(500).json({ msg: "Erreur interne lors de l'écriture" });
  }
});


// Delete a cocktail by ID
app.delete("/liste/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await readXmlFile();
    const cocktails = data.listeCocktails.cocktail;

    const updatedCocktails = cocktails.filter((c) => c.id !== id);

    if (cocktails.length === updatedCocktails.length) {
      msg = `Le cocktail n'a pas été trouvé`;
      return res.status(404).json({ msg });
    }

    data.listeCocktails.cocktail = updatedCocktails;

    await writeXmlFile(data);

    res.json({ msg: "Élément supprimé avec succès", liste: updatedCocktails });
  } catch (err) {
    console.error("Error deleting cocktail:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
