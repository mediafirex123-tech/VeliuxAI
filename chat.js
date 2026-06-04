export default async function handler(req, res) {
    // Handle CORS dan OPTIONS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    
    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    const API_KEY = process.env.OPENAI_API_KEY;
    
    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key tidak ditemukan. Tambahkan OPENAI_API_KEY di Vercel Environment Variables.' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Kamu adalah VeliuxAI, asisten AI yang cerdas, ramah, dan berwarna ungu aesthetic. Bantu pengguna dengan bahasa yang hangat dan solutif. Gunakan bahasa Indonesia yang natural.' 
                    },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenAI error:', data);
            throw new Error(data.error?.message || 'Gagal memproses permintaan ke OpenAI');
        }

        const reply = data.choices[0].message.content;
        res.status(200).json({ reply });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}