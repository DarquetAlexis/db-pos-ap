const json = (body, status = 200) => Response.json(body, { status });

export default async (request) => {
    if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

    const accessToken = Netlify.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) return json({ error: 'Falta configurar MP_ACCESS_TOKEN en Netlify' }, 500);

    try {
        const { amount, description } = await request.json();
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return json({ error: 'El monto del cobro no es válido' }, 400);
        }

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                items: [{ title: description || 'Dulce Bocado', unit_price: parsedAmount, quantity: 1 }],
                back_urls: {
                    success: 'https://dulcebocadopos.netlify.app',
                    failure: 'https://dulcebocadopos.netlify.app',
                    pending: 'https://dulcebocadopos.netlify.app'
                }
            })
        });

        const data = await response.json();
        if (!response.ok) return json({ error: data.message || 'Error al conectar con Mercado Pago' }, response.status);
        return json({ init_point: data.init_point });
    } catch (error) {
        console.error('checkout:', error);
        return json({ error: 'No fue posible crear el enlace de pago' }, 500);
    }
};
