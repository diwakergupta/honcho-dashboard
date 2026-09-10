import indexHtml from "../index.html";

const host = process.env.HOST ?? "localhost";
const port = Number(process.env.PORT ?? 3000);
const isDev = process.argv.includes("--hot");

Bun.serve({
  hostname: host,
  port,
  routes: {
    "/": indexHtml,
    "/*": indexHtml,
  },
  development: isDev,
});

console.log(`Honcho Dashboard: http://${host}:${port}`);
