// /netlify/functions/checkout.js
const axios = require('axios');

exports.handler = async (event) => {
    const { amount, description } = JSON.parse(event.body);
    
    try {
        const response = await axios.post('https://api.mercadopago.com/checkout/preferences', {
            items: [{ title: description, unit_price: Number(amount), quantity: 1 }],
            back_urls: { success: "https://dulcebocadopos.netlify.app", failure: "https://dulcebocadopos.netlify.app" }
        }, {
            headers: { 'Authorization': `Bearer APP_USR-1872229132375215-081916-289bce93650f1f5dd7ddcc95809aa5ba-333295261` }
        });

        return { statusCode: 200, body: JSON.stringify({ init_point: response.data.init_point }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
