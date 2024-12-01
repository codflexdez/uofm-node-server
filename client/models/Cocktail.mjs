export class Cocktail {
    #id;
    #nom;
    #type;
    #ingredients;
    #prix;
    #image;

    constructor(id, nom, type, ingredients, prix, image) {
      this.#id = id;
      this.#nom = nom;
      this.#type = type;
      this.#ingredients = ingredients;
      this.#prix = prix;
      this.#image = image;
    }

    // getters
    get id(){
        return this.#id;
    }
    get nom(){
        return this.#nom;
    }
    get type(){
        return this.#type;
    }
    get ingredients(){
        return this.#ingredients;
    }
    get prix(){
        return this.#prix;
    }
    get image(){
        return this.#image;
    }

    //setters
    set id(id) {
        this.#id = id;
    }
    set nom(nom) {
        this.#nom = nom;
    }
    set type(type) {
        this.#type = type;
    }
    set ingredients(ingredients) {
        this.#ingredients = ingredients;
    }
    set prix(prix) {
        this.#prix = prix;
    }
    set image(image) {
        this.#image = image;
    }  


    afficher(){
        return JSON.stringify({ id:this.#id, nom:this.#nom, type:this.#type, ingredients:this.#ingredients, prix:this.#prix, image:this.#image});
        
     } 

  }
  