import * as cheerio from "cheerio";
import { generateAIResponse } from "@/lib/anthropic";

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

function isInsufficient(job: ScrapedJob): boolean {
  const fieldCount = [job.jobTitle, job.company, job.location, job.description].filter(Boolean).length;
  const descTooShort = !job.description || job.description.length < 100;
  return fieldCount < 2 || descTooShort;
}

function extractPageText($: cheerio.CheerioAPI): string {
  // Remove scripts, styles, and nav elements
  $("script, style, nav, header, footer, iframe, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  // Limit to ~12k chars to stay within token limits
  return text.slice(0, 12000);
}

async function aiExtract(pageText: string, partialData: ScrapedJob): Promise<ScrapedJob> {
  const systemPrompt = `You are a job posting data extractor. Extract structured job information from raw page text. Return ONLY valid JSON with no markdown formatting, no code fences, and no explanation.`;

  const userPrompt = `Extract job posting details from this page text. Return a JSON object with these fields:
- jobTitle (string)
- company (string)
- location (string)
- description (string - the full job description including responsibilities, requirements, qualifications)
- salaryMin (number or null - annual salary minimum)
- salaryMax (number or null - annual salary maximum)
- salaryCurrency (string or null - e.g. "USD", "CAD")

Here is what we already extracted (may be partial/inaccurate):
${JSON.stringify(partialData, null, 2)}

Raw page text:
${pageText}`;

  try {
    const text = await generateAIResponse(systemPrompt, userPrompt, 4096);
    // Strip markdown code fences if present
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      jobTitle: parsed.jobTitle || undefined,
      company: parsed.company || undefined,
      location: parsed.location || undefined,
      description: parsed.description || undefined,
      salaryMin: parsed.salaryMin ?? undefined,
      salaryMax: parsed.salaryMax ?? undefined,
      salaryCurrency: parsed.salaryCurrency || undefined,
    };
  } catch {
    // If AI extraction fails, return what we have
    return partialData;
  }
}

export async function scrapeJobUrl(url: string, useAiFallback = true): Promise<ScrapedJob> {
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
  const ogData = extractOpenGraph($);
  const domData = extractFromDom($);

  const merged: ScrapedJob = { ...domData, ...ogData, ...jsonLd, url };

  // If data is insufficient and AI fallback is enabled, use Claude to extract
  if (useAiFallback && isInsufficient(merged)) {
    const pageText = extractPageText(cheerio.load(html));
    const aiData = await aiExtract(pageText, merged);
    // Merge: AI fills gaps, but keep existing good data
    return {
      jobTitle: merged.jobTitle || aiData.jobTitle,
      company: merged.company || aiData.company,
      location: merged.location || aiData.location,
      description: aiData.description || merged.description,
      salaryMin: merged.salaryMin ?? aiData.salaryMin,
      salaryMax: merged.salaryMax ?? aiData.salaryMax,
      salaryCurrency: merged.salaryCurrency || aiData.salaryCurrency,
      url,
    };
  }

  return merged;
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
