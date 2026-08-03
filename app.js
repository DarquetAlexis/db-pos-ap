const DB_STORAGE_KEY = "db_dulce_bocado_data";

const initialMenu = {
  frappes: {
    basico: [
      { name: "Moka", mediano: 50, grande: 60 },
      { name: "Capuchino", mediano: 50, grande: 60 },
      { name: "Fresa", mediano: 50, grande: 60 }
    ],
    premium: [
      { name: "Ferrero Rocher", mediano: 70, grande: 75 },
      { name: "Kinder Délice", mediano: 70, grande: 75 },
      { name: "Gansito", mediano: 70, grande: 75 },
      { name: "Bubu Lubu", mediano: 70, grande: 75 }
    ],
    especial: [
      { name: "M&M's", mediano: 65, grande: 70 },
      { name: "Oreo", mediano: 65, grande: 70 },
      { name: "Taro", mediano: 65, grande: 70 },
      { name: "Carlos V", mediano: 65, grande: 70 }
    ]
  },
  crepas: {
    dulces: [
      { name: "Crepa Ferrero (Nutella, Nuez, Almendra, Ferrero)", precio: 90 },
      { name: "Crepa Gansito (Nutella, Philadelphia, Fresa, Gansito)", precio: 90 },
      { name: "Crepa Kinder Délice (Nutella, Philadelphia, Kinder)", precio: 95 },
      { name: "Crepa Oreo (Nutella, Lechera, Oreo)", precio: 85 }
    ],
    saladas: [
      { name: "Crepa Peperoni (Manchego, Salsa Italiana, Peperoni)", precio: 80 },
      { name: "Crepa Hawaiana (Manchego, Jamón, Piña)", precio: 80 }
    ],
    ingredientesDisponibles: [
      "Nutella", "Cajeta", "Queso Philadelphia", "Mermelada de Fresa", 
      "Lechera", "Salsa Italiana", "Mermelada de Zarzamora", "Fresa", 
      "Plátano", "Piña", "Durazno", "Nuez", "Almendra", "Jamón", 
      "Manchego", "Peperoni", "Crema Batida"
    ]
  },
  chamoyadas: [
    { name: "PicaFresa (16 oz)", precio: 50 },
    { name: "Mango (16 oz)", precio: 50 }
  ],
  sodas: [
    { name: "Blue - Manzana (16 oz)", precio: 50 },
    { name: "Green - Manzana (16 oz)", precio: 50 },
    { name: "Cereza (16 oz)", precio: 50 }
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

initDatabase();
