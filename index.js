// imports
const readline = require("readline");
const petitio = require("petitio");

// other shit
const WEBHOOK_REGEX =
  /http(?:s)?:\/\/(?:(ptb|canary)\.)?discord\.com\/api\/webhooks\/([^\/]+)\/([^\/]+)/gi;

const RED = [235, 64, 52];

// functions
const println = (rgb = [], ...args) =>
  console.log(toRgb(rgb[0], rgb[1], rgb[2], args));

const printWhite = (...args) => println([255, 255, 255], args);

const toRgb = (r, g, b, ...args) =>
  `\x1b[38;2;${r};${g};${b}m${args.join(" ")}\x1b[0m`;

const ask = async (question) => {
  const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((res) =>
    interface.question(question, (a) => {
      interface.close();
      res(a);
    })
  );
};

// header fuckery
println(RED, "=".repeat(35));
printWhite(" ".repeat(14) + "Welcome.");
println(RED, "=".repeat(35));

// where we ask for shit and actually execute the fuckery
(async () => {
  const url = await ask("What is the of the webhook you'd like to spam? ");
  if (!WEBHOOK_REGEX.test(url)) {
    println(
      RED,
      "Could not resolve discord webhook properly. Please re-run this program."
    );
    process.exit(0);
  }

  const text = await ask(
    "Great. Now, what would you like to say on this webhook? "
  );
  if (!text.length) {
    println(RED, "Could not parse input. Please re-run this program.");
    process.exit(0);
  }

  let times = 0;
  const answer = await ask(
    "Okay, now how many times would you like to say this? "
  );
  const num = parseInt(answer);
  if (isNaN(num) || !isFinite(num)) {
    println(RED, "That is not a valid number. Please re-run this program.");
    process.exit(0);
  }

  times = num;

  const res = await petitio(url, "GET").send();
  if (res.statusCode === 404 || res.statusCode === 400) {
    println(RED, "The webhook you entered doesn't seem to exist. Exiting....");
    process.exit(0);
  }

  println(RED, "Time for an immense amount of trolling.");

  for (let i = 0; i < times; ++i) {
    const request = petitio(url, "POST");
    request.header("User-Agent", "DiscordBot, (v1.0.0, https://github.com)");
    request.body({
      content: text,
    });

    const resp = await request.send();
    printWhite(`Send Request #${i + 1}. Got statusCode ${resp.statusCode}`);
  }

  println(RED, "Immense amount of trolling done. Goodbye.");
  process.exit(0);
})();
