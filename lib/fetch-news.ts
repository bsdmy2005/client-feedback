const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${NEWS_API_KEY}`;

export interface NewsArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
  url: string;
  publishedAt: string;
}

export async function fetchLatestNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    console.error("NEWS_API_KEY is not set in the environment variables");
    return [];
  }

  const clientsQuery = encodeURIComponent(
    '("RMB" OR "Standard Bank" OR Nedbank OR ABSA OR ' +
    '"Swiss National Bank" OR Akbank OR "Yapi Kredi" OR Sanlam OR ' +
    'Momentum OR "HSBC Turkey" OR "Brevan Howard" OR Coremont OR ' +
    '"D360" OR "Olayan" OR "Saudi National Bank" OR SNB)'
  );

  const techQuery = encodeURIComponent(
    '("capital markets" OR "trading systems" OR fintech OR ' +
    '"market infrastructure" OR "artificial intelligence" OR AI OR ' +
    '"trading platform" OR "risk management system")'
  );

  const fullQuery = `${clientsQuery} AND ${techQuery}`;

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${fullQuery}&language=en&sortBy=publishedAt&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    if (data.articles.length === 0) {
      console.warn("No articles found. Trying broader query...");
      return await fetchBroaderNews(apiKey);
    }

    return data.articles.slice(0, 10); // Limit to 10 articles
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

async function fetchBroaderNews(apiKey: string): Promise<NewsArticle[]> {
  const broaderQuery = encodeURIComponent(
    '("capital markets" OR "trading systems" OR fintech OR ' +
    '"market infrastructure") AND ' +
    '(AI OR "artificial intelligence" OR blockchain OR cloud OR ' +
    '"risk management" OR "trading platform")'
  );

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${broaderQuery}&language=en&sortBy=publishedAt&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Broader API Response:", JSON.stringify(data, null, 2));

    return data.articles.slice(0, 10); // Limit to 10 articles
  } catch (error) {
    console.error("Error fetching broader news:", error);
    return [];
  }
}