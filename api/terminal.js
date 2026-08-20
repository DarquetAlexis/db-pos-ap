export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
        return res.status(500).json({ error: "Falta configurar MP_ACCESS_TOKEN en las variables de entorno de Vercel" });
    }

    try {
        if (req.method === 'GET') {
            const response = await fetch('https://api.mercadopago.com/terminals/v1/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                return res.status(response.status).json(data);
            }
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const { device_id, amount, description } = req.body;
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
            if (!paymentResponse.ok) {
                return res.status(paymentResponse.status).json(paymentData);
            }
            return res.status(200).json(paymentData);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
