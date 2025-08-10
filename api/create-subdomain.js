// File: api/create-subdomain.js

export default async function handler(request, response) {
  // Hanya izinkan metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Ambil data dari body permintaan frontend
    const { subdomain, domain, ipAddress } = request.body;

    // Validasi input dasar
    if (!subdomain || !domain || !ipAddress) {
      return response.status(400).json({ message: 'Input tidak lengkap.' });
    }

    // Ambil data domain RAHASIA dari Environment Variable di Vercel
    const domainDataString = process.env.CLOUDFLARE_DOMAINS;
    if (!domainDataString) {
        throw new Error('Konfigurasi domain tidak ditemukan di server.');
    }
    const domainData = JSON.parse(domainDataString);

    // Cari konfigurasi untuk domain yang dipilih
    const config = domainData[domain];
    if (!config) {
      return response.status(404).json({ message: 'Domain tidak ditemukan di konfigurasi.' });
    }

    const { zone, apitoken } = config;
    const fullDomain = `${subdomain}.${domain}`;

    // Panggil API Cloudflare dari sisi server (aman)
    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/dns_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apitoken}` // Token API digunakan di sini, tidak terlihat oleh pengguna
      },
      body: JSON.stringify({
        type: 'A',
        name: fullDomain,
        content: ipAddress,
        ttl: 1, // 1 = Otomatis
        proxied: false
      })
    });

    const result = await cfResponse.json();

    // Kirim kembali hasil dari Cloudflare ke frontend
    if (result.success) {
      return response.status(200).json(result);
    } else {
      return response.status(400).json(result);
    }

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Terjadi kesalahan internal pada server.', error: error.message });
  }
}
