/**
 * Utility to fetch publications from PubMed via NCBI E-utilities API
 * Documentation: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 */

export interface PubMedArticle {
  id: string;
  title: string;
  journal: string;
  pubDate: string;
  authors: string[];
  link: string;
  doi?: string;
}

const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const DB = "pubmed";
// Search query for Dr. Abdullah M. Al Alawi
// Using specific variations to ensure accuracy
const SEARCH_TERM = "Al Alawi AM[Author]";

export async function fetchLatestPublications(limit = 10): Promise<PubMedArticle[]> {
  try {
    // Step 1: Search for IDs
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=${DB}&term=${encodeURIComponent(SEARCH_TERM)}&retmode=json&retmax=${limit}&sort=date`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
      return [];
    }

    const ids = searchData.esearchresult.idlist;

    // Step 2: Fetch details for these IDs
    const summaryUrl = `${BASE_URL}/esummary.fcgi?db=${DB}&id=${ids.join(",")}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    if (!summaryData.result) {
      return [];
    }

    // Step 3: Transform data
    const articles: PubMedArticle[] = ids.map((id: string) => {
      const item = summaryData.result[id];
      if (!item) return null;

      // Extract authors
      const authors = item.authors ? item.authors.map((a: any) => a.name) : [];

      // Extract DOI if available
      const doiId = item.articleids ? item.articleids.find((aid: any) => aid.idtype === "doi") : null;
      const doi = doiId ? doiId.value : undefined;

      return {
        id: id,
        title: item.title,
        journal: item.source,
        pubDate: item.pubdate,
        authors: authors,
        link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        doi: doi
      };
    }).filter(Boolean);

    return articles;
  } catch (error) {
    console.error("Error fetching from PubMed:", error);
    throw error;
  }
}
