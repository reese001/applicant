import * as cheerio from "cheerio";

interface ScrapedJob {
  jobTitle?: string;
  company?: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  url?: string;
}

export async function scrapeJobUrl(url: string): Promise<ScrapedJob> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const jsonLd = extractJsonLd($);
  if (jsonLd && Object.keys(jsonLd).length >= 2) {
    return { ...jsonLd, url };
  }

  const ogData = extractOpenGraph($);
  const domData = extractFromDom($);

  return { ...domData, ...ogData, ...jsonLd, url };
}

function extractJsonLd($: cheerio.CheerioAPI): ScrapedJob | null {
  const result: ScrapedJob = {};

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "");
      const job =
        data["@type"] === "JobPosting"
          ? data
          : Array.isArray(data["@graph"])
            ? data["@graph"].find(
                (item: Record<string, string>) => item["@type"] === "JobPosting"
              )
            : null;

      if (job) {
        result.jobTitle = job.title;
        result.company =
          typeof job.hiringOrganization === "string"
            ? job.hiringOrganization
            : job.hiringOrganization?.name;
        result.location =
          typeof job.jobLocation === "string"
            ? job.jobLocation
            : job.jobLocation?.address?.addressLocality;
        result.description = job.description?.replace(/<[^>]*>/g, " ").trim();

        if (job.baseSalary?.value) {
          result.salaryMin = job.baseSalary.value.minValue;
          result.salaryMax = job.baseSalary.value.maxValue;
          result.salaryCurrency = job.baseSalary.currency;
        }
      }
    } catch {
      // ignore parse errors
    }
  });

  return Object.keys(result).length > 0 ? result : null;
}

function extractOpenGraph($: cheerio.CheerioAPI): ScrapedJob {
  return {
    jobTitle: $('meta[property="og:title"]').attr("content") || undefined,
    description:
      $('meta[property="og:description"]').attr("content") || undefined,
  };
}

function extractFromDom($: cheerio.CheerioAPI): ScrapedJob {
  const result: ScrapedJob = {};

  const titleSelectors = [
    "h1.job-title", "h1.posting-headline", ".job-title h1",
    '[data-testid="jobTitle"]', ".topcard__title", "h1",
  ];
  for (const sel of titleSelectors) {
    const text = $(sel).first().text().trim();
    if (text && text.length < 200) {
      result.jobTitle = text;
      break;
    }
  }

  const companySelectors = [
    ".company-name", '[data-testid="company"]', ".topcard__org-name-link",
    '[class*="company"]', '[class*="employer"]',
  ];
  for (const sel of companySelectors) {
    const text = $(sel).first().text().trim();
    if (text && text.length < 100) {
      result.company = text;
      break;
    }
  }

  const locationSelectors = [
    ".job-location", '[data-testid="location"]', ".topcard__flavor--bullet",
    '[class*="location"]',
  ];
  for (const sel of locationSelectors) {
    const text = $(sel).first().text().trim();
    if (text && text.length < 100) {
      result.location = text;
      break;
    }
  }

  return result;
}
