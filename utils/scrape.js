const got = require("got"); // v11
const cheerio = require("cheerio");
const { chromium } = require("playwright");

async function scrapeMeta(url) {
  try {
    let finalUrl = url;
    let title = "";
    let description = "";
    let images = [];

    // STEP 1: Try fast fetch with got
    try {
      const response = await got(url, { timeout: 10000, followRedirect: true });
      finalUrl = response.url;
      const $ = cheerio.load(response.body);

      title =
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text().trim() ||
        "";

      description =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";

      images = $('meta[property="og:image"]')
        .map((_, el) => $(el).attr("content"))
        .get();

      if (images.length === 0) {
        const twitterImg = $('meta[name="twitter:image"]').attr("content");
        if (twitterImg) images.push(twitterImg);
      }
    } catch (err) {
      console.warn("got failed, fallback to Playwright:", err.message);
    }

    // STEP 2: Fallback to Playwright if missing critical data
    if (!title || !description || images.length === 0) {
      const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      // give MSN a couple seconds to settle
      await page.waitForTimeout(3000);
      // Collect meta tags
      const metaTags = await page.$$eval("meta", (tags) =>
        tags.map((t) => ({
          name: t.getAttribute("name"),
          property: t.getAttribute("property"),
          content: t.getAttribute("content"),
        }))
      );

      // Map metas into lookup
      const metas = {};
      metaTags.forEach((tag) => {
        if (tag.property && tag.content) metas[tag.property] = tag.content;
        if (tag.name && tag.content) metas[tag.name] = tag.content;
      });

      title =
        title ||
        metas["og:title"] ||
        metas["twitter:title"] ||
        (await page.title());
      description =
        description ||
        metas["og:description"] ||
        metas["twitter:description"] ||
        metas["description"] ||
        "";
      if (images.length === 0) {
        if (metas["og:image"]) images.push(metas["og:image"]);
        if (metas["twitter:image"]) images.push(metas["twitter:image"]);
      }

      finalUrl = page.url();
      await browser.close();
    }

    return { title, description, images, url: finalUrl };
  } catch (err) {
    console.error("Scraping error:", err.message);
    return { title: "", description: "", images: [], url };
  }
}

module.exports = scrapeMeta;
