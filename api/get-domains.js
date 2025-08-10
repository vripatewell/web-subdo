
export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        if (!authenticate(request).isValid) {
            return response.status(401).json({ message: 'API Key tidak valid atau tidak diberikan.' });
        }
        
        // Baca variabel BARU yang hanya berisi data domain
        const domainDataString = process.env.CLOUDFLARE_DOMAINS;
        if (!domainDataString) {
            throw new Error('Konfigurasi domain tidak ditemukan di server.');
        }

        const domainData = JSON.parse(domainDataString);
        const domainNames = Object.keys(domainData);
        
        return response.status(200).json(domainNames);

    } catch (error) {
        return response.status(500).json({ message: 'Kesalahan Internal Server', error: error.message });
    }
}
