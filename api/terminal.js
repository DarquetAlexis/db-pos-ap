export default async function handler(req, res) {
  // Permitir peticiones desde tu app web
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const ACCESS_TOKEN = 'APP_USR-1872229132375215-080519-de40675d32922719e872aa670427-333295261';

  try {
    // 1. Obtener la lista de terminales desde los servidores de Mercado Pago
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

    // 2. Si piden crear un pago/orden en la terminal (POST)
    if (req.method === 'POST') {
      const { device_id, amount, description } = req.body;
      
 const paymentResponse = await fetch(`https://api.mercadopago.com/point/v1/terminals/${device_id}/payment`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  },
  body: JSON.stringify({
    amount: amount,
    description: description || "Dulce Bocado"
  })
});

      const paymentData = await paymentResponse.json();
      return res.status(paymentResponse.status).json(paymentData);
    }

    // Por defecto devuelve las terminales encontradas
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
