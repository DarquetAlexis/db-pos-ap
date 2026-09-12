import { staffSession, sameOrigin } from './_shared/staff-session.mts';

const json = (body, status = 200) => Response.json(body, { status });

async function mercadoPago(url, accessToken, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...options.headers
        }
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text || 'Respuesta inválida de Mercado Pago' }; }
    return { response, data };
}

export default async (request) => {
    if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Método no permitido' }, 405);

    const staffUser = staffSession(request);
    if (!staffUser) return json({ error: 'Acceso exclusivo para personal autorizado' }, 401);

    if (request.method === 'POST' && !sameOrigin(request)) return json({error:'Origen no permitido'},403);
    const accessToken = Netlify.env.get('MP_ACCESS_TOKEN');
    if (!accessToken) return json({ error: 'Falta configurar MP_ACCESS_TOKEN en Netlify' }, 500);

    try {
        const terminalResult = await mercadoPago(
            'https://api.mercadopago.com/terminals/v1/list?limit=50',
            accessToken
        );
        if (!terminalResult.response.ok) {
            return json({ error: terminalResult.data.message || 'No se pudieron consultar las terminales Point' }, terminalResult.response.status);
        }

        const terminals = terminalResult.data?.data?.terminals || [];
        if (!terminals.length) {
            return json({ error: 'No hay una terminal Point activa vinculada a esta cuenta de Mercado Pago' }, 404);
        }

        if (request.method === 'GET') {
            return json({ connected: true, terminal_count: terminals.length });
        }

        const { amount, description } = await request.json();
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return json({ error: 'El monto del cobro no es válido' }, 400);
        }

        const idempotencyKey = crypto.randomUUID();
        const orderResult = await mercadoPago('https://api.mercadopago.com/v1/orders', accessToken, {
            method: 'POST',
            headers: { 'X-Idempotency-Key': idempotencyKey },
            body: JSON.stringify({
                type: 'point',
                external_reference: `dulce-bocado-${Date.now()}`,
                expiration_time: 'PT16M',
                transactions: { payments: [{ amount: parsedAmount.toFixed(2) }] },
                config: {
                    point: { terminal_id: terminals[0].id, print_on_terminal: 'no_ticket' },
                    payment_method: { default_type: 'credit_card' }
                },
                description: description || 'Dulce Bocado'
            })
        });

        if (!orderResult.response.ok) {
            return json({ error: orderResult.data.message || orderResult.data.error || 'Mercado Pago rechazó el cobro' }, orderResult.response.status);
        }
        return json({ order_id: orderResult.data.id, terminal_id: terminals[0].id });
    } catch (error) {
        console.error('terminal:', error);
        return json({ error: 'No fue posible comunicarse con Mercado Pago' }, 500);
    }
};
