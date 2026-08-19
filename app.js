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

    mostrarToast("⏳ Buscando tu terminal Point...");

    const ACCESS_TOKEN = 'APP_USR-1872229132375215-081916-289bce93650f1f5dd7ddcc95809aa5ba-333295261';

    try {
        // 1. Obtenemos automáticamente el ID de la terminal activa usando el endpoint que consultaste
        let resTerminals = await fetch('https://api.mercadopago.com/terminals/v1/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        let dataTerminals = await resTerminals.json();
        
        // Verificamos si hay terminales registradas
        let terminalsList = dataTerminals.data?.terminals || dataTerminals.terminals;
        if (!terminalsList || terminalsList.length === 0) {
            alert("⚠️ No se encontró ninguna terminal Point activa asociada a tu cuenta.");
            return;
        }

        // Tomamos la primera terminal activa de la lista (ej. tu Point Smart 2)
        let DEVICE_ID = terminalsList[0].id;
        mostrarToast(`✨ Conectando con terminal: ${DEVICE_ID}`);

        // 2. Enviamos la orden de cobro directamente a ese dispositivo
        let respuesta = await fetch(`https://api.mercadopago.com/v1/pos/${DEVICE_ID}/orders`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
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
            alert("✨ ¡Orden enviada con éxito! Revisa tu Point Smart para deslizar o acercar la tarjeta.");
            
            setTimeout(() => {
                if (confirm("¿El pago fue aprobado exitosamente en la terminal?")) {
                    finalizarYCobrarOrden("Tarjeta (Point Smart)");
                }
            }, 3000);
        } else {
            console.error("Error MP:", resultado);
            alert("⚠️ La terminal no respondió a la orden. Verifica que tenga conexión a internet.");
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("⚠️ Error de conexión al comunicarse con Mercado Pago.");
    }
}
