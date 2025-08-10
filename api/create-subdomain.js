
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    if (!authenticate(request).isValid) {
        return response.status(401).json({ message: 'API Key tidak valid atau tidak diberikan.' });
    }

    const { subdomain, domain, ipAddress } = request.body;
    if (!subdomain || !domain || !ipAddress) {
      return response.status(400).json({ message: 'Input tidak lengkap.' });
    }

    // Baca variabel BARU yang hanya berisi data domain
    const domainDataString = process.env.CLOUDFLARE_DOMAINS;
    if (!domainDataString) {
        throw new Error('Konfigurasi domain tidak ditemukan di server.');
    }
    const domainData = JSON.parse(domainDataString);

    const domainConfig = domainData[domain];
    if (!domainConfig) {
      return response.status(404).json({ message: 'Domain tidak ditemukan di konfigurasi.' });
    }

    const { zone, apitoken } = domainConfig;
    const fullDomain = `${subdomain}.${domain}`;

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/dns_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apitoken}`
      },
      body: JSON.stringify({ type: 'A', name: fullDomain, content: ipAddress, ttl: 1, proxied: false })
    });

    const result = await cfResponse.json();

    if (result.success) {
      return response.status(200).json(result);
    } else {
      const errorMessage = result.errors?.[0]?.message || 'Gagal membuat subdomain.';
      return response.status(400).json({ ...result, message: errorMessage });
    }

  } catch (error) {
    return response.status(500).json({ message: 'Kesalahan Internal Server', error: error.message });
  }
}
