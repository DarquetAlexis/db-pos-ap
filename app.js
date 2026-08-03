const DB_STORAGE_KEY = "db_dulce_bocado_data";

const initialMenu = {
  frappes: [
    { id: 1, name: "Moka", tipo: "basico", mediano: 50, grande: 60, personaje: "Fran" },
    { id: 2, name: "Capuchino", tipo: "basico", mediano: 50, grande: 60, personaje: "Fran" },
    { id: 3, name: "Fresa", tipo: "basico", mediano: 50, grande: 60, personaje: "Fran" },
    { id: 4, name: "Ferrero Rocher", tipo: "premium", mediano: 70, grande: 75, personaje: "Fran" },
    { id: 5, name: "Kinder Délice", tipo: "premium", mediano: 70, grande: 75, personaje: "Fran" },
    { id: 6, name: "Gansito", tipo: "premium", mediano: 70, grande: 75, personaje: "Fran" },
    { id: 7, name: "Bubu Lubu", tipo: "premium", mediano: 70, grande: 75, personaje: "Fran" },
    { id: 8, name: "M&M's", tipo: "especial", mediano: 65, grande: 70, personaje: "Fran" },
    { id: 9, name: "Oreo", tipo: "especial", mediano: 65, grande: 70, personaje: "Fran" },
    { id: 10, name: "Taro", tipo: "especial", mediano: 65, grande: 70, personaje: "Fran" },
    { id: 11, name: "Carlos V", tipo: "especial", mediano: 65, grande: 70, personaje: "Fran" }
  ],
  crepas: {
    basePrecio: 50,
    incluidosBase: 0,
    precioConDos: 70,
    extraPorIngrediente: 10
  },
  chamoyadas: [
    { id: 1, name: "PicaFresa", precio: 50, personaje: "Moy" },
    { id: 2, name: "Mango", precio: 50, personaje: "Moy" }
  ],
  sodas: [
    { id: 1, name: "Blue (Manzana)", precio: 50, personaje: "Talia" },
    { id: 2, name: "Green (Manzana)", precio: 50, personaje: "Talia" },
    { id: 3, name: "Cereza", precio: 50, personaje: "Talia" }
  ]
};

function initDatabase() {
  if (!localStorage.getItem(DB_STORAGE_KEY)) {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initialMenu));
  }
  if (!localStorage.getItem("db_orders")) {
    localStorage.setItem("db_orders", JSON.stringify([]));
  }
}

function getMenu() {
  return JSON.parse(localStorage.getItem(DB_STORAGE_KEY));
}

function calcularPrecioCrepa(cantidadIngredientes) {
  if (cantidadIngredientes <= 0) return 50;
  if (cantidadIngredientes === 2) return 70;
  if (cantidadIngredientes === 1) return 60;
  return 50 + (cantidadIngredientes * 10);
}

initDatabase();