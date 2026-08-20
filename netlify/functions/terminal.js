const fetch = require('node-fetch'); // O usa el fetch global nativo de Node.js si está disponible

exports.handler = async function(event, context) {
    // Permitir CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Falta configurar MP_ACCESS_TOKEN en las variables de entorno de Netlify" })
        };
    }

    try {
        if (event.httpMethod === 'GET') {
            const response = await fetch('https://api.mercadopago.com/terminals/v1/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });
            const data = await response.json();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify(data)
            };
        }

        if (event.httpMethod === 'POST') {
            const bodyData = JSON.parse(event.body || '{}');
            const { device_id, amount, description } = bodyData;

            const paymentResponse = await fetch(`https://api.mercadopago.com/point/integration-devices/${device_id}/payment-intents`, {
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
            const paymentData = await paymentResponse.json();
            return {
                statusCode: paymentResponse.status,
                headers,
                body: JSON.stringify(paymentData)
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
