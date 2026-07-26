import * as cheerio from "cheerio";

export async function scrapeWebsite(url: string) {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  const response = await fetch(normalizedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AutoGTMBot/1.0; +https://yoursite.com)",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, noscript, iframe").remove();

  const title = $("title").text().trim();
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  const headings = $("h1, h2, h3")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 20);

  const paragraphs = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 20)
    .slice(0, 15);

  const links = $("a[href]")
    .map((_, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr("href") || "",
    }))
    .get()
    .filter((l) => l.text && l.href)
    .slice(0, 30);

  return {
    url: normalizedUrl,
    title,
    description,
    headings,
    paragraphs,
    links,
    textContent: `${title}\n${description}\n${headings.join("\n")}\n${paragraphs.join("\n")}`.slice(
      0,
      4000
    ),
  };
}

export async function searchGoogle(query: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(10000),
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const results: { title: string; url: string; snippet: string }[] = [];

  $(".result").each((_, el) => {
    const title = $(el).find(".result__title").text().trim();
    const link = $(el).find(".result__url").text().trim();
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title && link) {
      results.push({
        title,
        url: link.startsWith("http") ? link : `https://${link}`,
        snippet,
      });
    }
  });

  return results.slice(0, 10);
}
