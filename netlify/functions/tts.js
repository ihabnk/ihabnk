export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.AZURE_TTS_KEY;
  const region = process.env.AZURE_TTS_REGION;

  if (!apiKey || !region) {
    return { statusCode: 503, body: 'no-config' };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'invalid-json' };
  }

  const { text, lang } = parsed;
  if (!text || typeof text !== 'string') {
    return { statusCode: 400, body: 'missing-text' };
  }

  // Neural voices: ar-SA-ZariyahNeural (Arabic), en-US-JennyNeural (English)
  const voice   = lang === 'ar' ? 'ar-SA-ZariyahNeural' : 'en-US-JennyNeural';
  const xmlLang = lang === 'ar' ? 'ar-SA' : 'en-US';

  // Escape XML special characters before embedding in SSML
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const ssml = `<speak version='1.0' xml:lang='${xmlLang}'><voice name='${voice}'>${safeText}</voice></speak>`;
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'ihabnk-site/1.0',
      },
      body: ssml,
    });

    if (!response.ok) {
      const err = await response.text().catch(() => '');
      console.error('Azure TTS error:', response.status, err);
      return { statusCode: response.status, body: 'tts-error' };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('TTS function error:', err);
    return { statusCode: 500, body: 'internal-error' };
  }
};
