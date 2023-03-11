const PORT = process.env.PORT || 3000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const newspapers = [
  {
    name: "thetimes",
    adress: "https://www.thetimes.co.uk/environment/climate-change",
    base: "",
  },
  {
    name: "guardian",
    adress: "https://www.theguardian.com/environment/climate-crisis",
    base: "",
  },
  {
    name: "telegraph",
    adress: "https://www.telegraph.co.uk/climate-change",
    base: "https://www.telegraph.co.uk",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.adress).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $("a:contains('climate')", html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("welcome to my server");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;
  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].adress;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const singleArticle = [];

      $('a:contains("climate")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");

        singleArticle.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        });
      });
      res.json(singleArticle);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
