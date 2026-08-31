// netlify/functions/checkout.js
exports.handler = async (event) => {
    try {
        const { amount, description } = JSON.parse(event.body);

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer APP_USR-1872229132375215-081916-289bce93650f1f5dd7ddcc95809aa5ba-333295261'
            },
            body: JSON.stringify({
                items: [
                    {
                        title: description,
                        unit_price: Number(amount),
                        quantity: 1
                    }
                ],
                back_urls: {
                    success: "https://dulcebocadopos.netlify.app",
                    failure: "https://dulcebocadopos.netlify.app"
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al conectar con Mercado Pago');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ init_point: data.init_point })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
