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
            { name: "Crepa Ferrero", descripcion: "Nutella, Nuez, Almendra, Ferrero", precio: 90 },
            { name: "Crepa Gansito", descripcion: "Nutella, Philadelphia, Fresa, Gansito", precio: 90 },
            { name: "Crepa Kinder Délice", descripcion: "Nutella, Philadelphia, Kinder", precio: 95 },
            { name: "Crepa Oreo", descripcion: "Nutella, Lechera, Oreo", precio: 85 }
        ],
        saladas: [
            { name: "Crepa Peperoni", descripcion: "Manchego, Salsa Italiana, Peperoni", precio: 80 },
            { name: "Crepa Hawaiana", descripcion: "Manchego, Jamón, Piña", precio: 80 }
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

async function cobrarConTarjetaPoint() {
    let orden = obtenerOrdenActiva();
    if (!orden) return;
    let total = orden.items.reduce((a, b) => a + b.precio, 0);

    // Identificador de tu terminal Point Smart (número de serie terminado en 2330)
    const DEVICE_ID = "PROVOX_..._2330"; 

    mostrarToast("⏳ Conectando con tu Point Smart...");

    try {
        let respuesta = await fetch(`https://api.mercadopago.com/v1/pos/${DEVICE_ID}/orders`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer APP_USR-1872229132375215-080519-de40675c3d2922719e872aa0fa670427-333295261'
            },
            body: JSON.stringify({
                external_reference: "ORDEN_" + orden.id,
                items: [
                    {
                        title: `Cuenta ${orden.cliente}`,
                        unit_price: Number(total),
                        quantity: 1,
                        unit_measure: "unit"
                    }
                ],
                total_amount: Number(total),
                payment: {
                    installments: 1,
                    type: "credit_card"
                }
            })
        });

        let resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("✨ ¡Orden enviada! La terminal Point Smart está lista para recibir la tarjeta.");
            
            setTimeout(() => {
                if (confirm("¿El pago fue aprobado exitosamente en la terminal?")) {
                    finalizarYCobrarOrden("Tarjeta (Point Smart)");
                }
            }, 3000);
        } else {
            console.error("Error MP:", resultado);
            alert("⚠️ No se pudo contactar con la terminal. Verifica que tenga internet y esté activa.");
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("⚠️ Error de conexión con la API.");
    }
}
