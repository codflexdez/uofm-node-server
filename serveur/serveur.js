import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const fichierCourrant = fileURLToPath(import.meta.url);

const dirPath = path.dirname(fichierCourrant); //le chemin absolu du répertoire du fichier courant
const filePath = path.join(dirPath, "donnees", "cocktails.json");

// Middleware pour les fichiers statiques
app.use(express.static(path.join(dirPath, "../client")));


let msg = "";

// ROUTES À FAIRE

// Récupérer la liste des coctails
app.get("/liste", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la lecture du fichier" });
    }
    res.send(data);
  });
});

app.post("/liste", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming request body

    const cocktail = req.body;

    const donnees = await fs.promises.readFile(filePath, { encoding: "utf8" });

    const tabCocktails = JSON.parse(donnees);
    console.log(tabCocktails);

    tabCocktails.push(cocktail);

    await fs.promises.writeFile(
      filePath,
      JSON.stringify(tabCocktails, null, 2)
    );

    msg = `Le cocktail ${cocktail.nom} a ete ajouté avec succes`;
    res.json({ msg: msg });
  } catch (error) {
    console.error("Erreur lors de l'ajout du cocktail:", error.message);
    msg = `Problème pour enregistrer le cocktail.`;
    res.status(500).json({ msg: msg });
  }
});


app.put("/liste/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cocktailMod = req.body;
    const donnees = await fs.promises.readFile(filePath, { encoding: "utf8" });
    const tabCocktails = JSON.parse(donnees);

    const index = tabCocktails.findIndex((cocktail) => cocktail.id === id);

    if (index === -1) {
      msg = `Le cocktail n'a pas été trouvé`;
      return res.status(404).json({ msg: msg });
    }
    tabCocktails[index] = { ...tabCocktails[index], ...cocktailMod };

    await fs.promises.writeFile(
      filePath,
      JSON.stringify(tabCocktails, null, 2)
    );

    msg = `Le cocktail était modifié avec succes`;
    res.status(200).json({ msg: msg });
  } catch (err) {
    console.error("Erreur de modification de cocktail:", err);
    res.status(500).json({ message: "Erreur interne lors de l'écriture" });
  }
});

// Supprimer un élément
app.delete("/liste/:id", (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(filePath, "utf8", (err, donnees) => {
    if (err)
      return res.status(500).json({ error: "Erreur lors de la lecture" });
    let liste = JSON.parse(donnees);
    const nList = liste.filter((e) => e.id !== id);

    fs.writeFile(
      filePath,
      JSON.stringify(nList, null, 2),
      { encoding: "utf8" },
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Erreur lors de l'écriture" });
        }
        res
          .status(200)
          .json({ msg: "Élément supprimé avec succes", liste: nList });
      }
    );
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
