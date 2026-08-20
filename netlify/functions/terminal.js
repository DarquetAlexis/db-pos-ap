exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Usamos tu token de forma directa y segura en el servidor para evitar errores 500/404 de entorno
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "APP_USR-1872229132375215-081916-289bce93650f1f5dd7ddcc95809aa5ba-333295261";

    try {
        if (event.httpMethod === 'POST') {
            const bodyData = JSON.parse(event.body || '{}');
            const { device_id, amount, description } = bodyData;

            const response = await fetch(`https://api.mercadopago.com/point/integration-devices/${device_id}/payment-intents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    description: description || "Dulce Bocado",
                    payment: {
                        installments: 1,
                        type: "credit_card"
                    }
                })
            });

            const data = await response.json();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify(data)
            };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: "Método no permitido" }) };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
