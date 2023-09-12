const path = require("path");
const axios = require("axios");
const cheerio = require('cheerio');
const atom = require("./atom");
const moment = require("moment");

// const { promisify } = require('util');
// const exec = promisify(require("child_process").exec);

// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: true
})

const root = path.join(__dirname, "..", 'public');

// static page where the user can format urls
fastify.register(require('@fastify/static'), { root });


// // Declare a route
// fastify.get('/another/path', function (req, reply) {
//   reply.sendFile('output.gif') // serving path.join(__dirname, 'public', 'myHtml.html') directly
// })

// fastify.get('/video', function (req, reply) {
//   reply.sendFile('output.gif'); // serving path.join(__dirname, 'public', 'myHtml.html') directly
// });

// fastify.get("/gen-video", async () => {
//   const url = "https://img-egc.xvideos-cdn.com/videos/videopreview/ad/41/ce/ad41cefb12a2c82a603a2ad621b4304c_169.mp4";

//   exec(`ffmpeg -i "${url}" ` +
//     `-vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ` +
//     `-loop 0 public/output.gif`);

//   // exec(`ffmpeg -i "${url}" -qscale 0 output.gif`);
  
//   return { ok: 1 };
// });

fastify.route({
  method: 'GET',
  url: '/rss',
  schema: {
    query: {
      url: { type: 'string' },
    }
  },
  handler: async (request, reply) => {
    const { url } = request.query;
    if (!url) {
      throw new Error("missing url");
    }

    const res = await axios.get(url);

    const $ = cheerio.load(res.data);

    const titleChunks = $(".filter_active").map((i, elem) => {
      return $(elem).text().trim().split("\n").join(" ");
    }).toArray();
    
    const feedHrefHtml = $('head link[rel="canonical"]').attr("href");
    const feedTitle = titleChunks.join(" ");
    const feedSubtitle = $(`meta[name="description"]`).attr("content");
    const feedUpdated = moment().format();

    const entries = $(".annuncio_bloccohome").map((i, elem) => {
      const authorName = $(elem).find(".txt_nick").text().trim();
      const location = $(elem).find(".nickfirstbox div:last-child");
      const media = $(elem).find(".image_profilebox > a img:last-child");
      const content = $(elem).find(".testo_annuncio").text().trim();

      const baseHref = $(elem).find(".image_profilebox > a").attr("href");
      const linkHref = "https://www.annunci69.it" + baseHref;

      return {
        title: authorName +" - "+ location.text().trim().split("\n").join(" "),
        authorName,
        authorUri: linkHref,
        id: linkHref,
        mediaThumbnailUrl: media.attr("src"),
        linkHref,
        updatedDate: feedUpdated,
        publishedDate: feedUpdated,
        content
      };
    }).toArray();

    const feedPayload = atom.feed({
      feedCategoryTerm: titleChunks.join("_"),
      feedCategoryLabel: feedTitle,
      feedTitle,
      feedUpdated,
      feedIcon: "https://www.annunci69.it/favicon.ico",
      feedId: url,
      feedHrefXml: "http://127.0.0.1:3000/rss?url=" + encodeURIComponent(url),
      feedHrefHtml,
      feedSubtitle,
      entries
    });

    reply.send(feedPayload);
  }
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});