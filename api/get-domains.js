// File: api/get-domains.js
export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const domainDataString = process.env.CLOUDFLARE_DOMAINS;
        if (!domainDataString) {
            throw new Error('Konfigurasi domain tidak ditemukan di server.');
        }

        const domainData = JSON.parse(domainDataString);
        const domainNames = Object.keys(domainData); // Mengambil hanya nama domain

        return response.status(200).json(domainNames);

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Gagal memuat daftar domain.', error: error.message });
    }
}
