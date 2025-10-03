const express = require("express");
const scrapeMeta = require("./utils/scrape");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => res.send("Link Preview API running"));

app.post("/preview", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const meta = await scrapeMeta(url);
    res.json(meta);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      title: "",
      description: "",
      images: [],
      url,
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
