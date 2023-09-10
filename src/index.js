const path = require("path");
const { promisify } = require('util');

const exec = promisify(require("child_process").exec);


// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: true
})

console.log("debug __dirname", __dirname);

const root = path.join(__dirname, "..", 'public');

console.log("debug root", root);

// static page where the user can format urls
fastify.register(require('@fastify/static'), { root });


// // Declare a route
// fastify.get('/another/path', function (req, reply) {
//   reply.sendFile('output.gif') // serving path.join(__dirname, 'public', 'myHtml.html') directly
// })

// fastify.get('/video', function (req, reply) {
//   reply.sendFile('output.gif'); // serving path.join(__dirname, 'public', 'myHtml.html') directly
// });

fastify.get("/gen-video", async () => {
  const url = "https://img-egc.xvideos-cdn.com/videos/videopreview/ad/41/ce/ad41cefb12a2c82a603a2ad621b4304c_169.mp4";

  exec(`ffmpeg -i "${url}" ` +
    `-vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ` +
    `-loop 0 public/output.gif`);

  // exec(`ffmpeg -i "${url}" -qscale 0 output.gif`);
  
  return { ok: 1 };
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});