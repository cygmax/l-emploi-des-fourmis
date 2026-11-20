export interface ScrapedData {
  titre: string;
  entreprise: string;
  description: string;
}

function parseOpenGraph(html: string): Partial<ScrapedData> {
  const result: Partial<ScrapedData> = {};

  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitle) result.titre = ogTitle[1];

  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (ogDesc) result.description = ogDesc[1];

  const titleTag = html.match(/<title>([^<]+)<\/title>/i);
  if (!result.titre && titleTag) {
    result.titre = titleTag[1].split('—')[0].split('|')[0].split('-')[0].trim();
  }

  return result;
}

function parseWelcomeToTheJungle(html: string): Partial<ScrapedData> {
  const result = parseOpenGraph(html);

  // WTTJ specific: company name often in JSON-LD
  const jsonLd = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i);
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd[1]);
      if (data.name && !result.titre) result.titre = data.name;
      if (data.hiringOrganization?.name) result.entreprise = data.hiringOrganization.name;
    } catch {}
  }

  return result;
}

function parseLinkedIn(html: string): Partial<ScrapedData> {
  const result = parseOpenGraph(html);

  // LinkedIn often has company in og:description: "Company Name is hiring..."
  if (result.description && !result.entreprise) {
    const match = html.match(/companyName["']:\s*["']([^"']+)/i);
    if (match) result.entreprise = match[1];
  }

  return result;
}

function parseIndeed(html: string): Partial<ScrapedData> {
  const result = parseOpenGraph(html);

  const companyMatch = html.match(/company["']:\s*["']([^"']+)/i);
  if (companyMatch) result.entreprise = companyMatch[1];

  return result;
}

export async function scrapeUrl(url: string): Promise<{
  success: boolean;
  data: ScrapedData;
  error?: string;
}> {
  const defaultData: ScrapedData = { titre: '', entreprise: '', description: '' };

  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FourmisBot/1.0)' },
    });

    if (!response.ok) {
      return {
        success: false,
        data: defaultData,
        error: `Erreur HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    let parsed: Partial<ScrapedData> = {};

    if (url.includes('welcomehunt') || url.includes('welcometothejungle')) {
      parsed = parseWelcomeToTheJungle(html);
    } else if (url.includes('linkedin.com')) {
      parsed = parseLinkedIn(html);
    } else if (url.includes('indeed.com')) {
      parsed = parseIndeed(html);
    } else {
      parsed = parseOpenGraph(html);
    }

    return {
      success: true,
      data: {
        titre: parsed.titre || 'Offre d\'emploi',
        entreprise: parsed.entreprise || '',
        description: parsed.description || '',
      },
    };
  } catch (err) {
    return {
      success: false,
      data: defaultData,
      error: err instanceof TypeError && err.message.includes('CORS')
        ? 'Impossible d\'accéder à cette page (CORS). Remplis les champs manuellement.'
        : `Erreur : ${err instanceof Error ? err.message : 'inconnue'}`,
    };
  }
}