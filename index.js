const notifier = require("node-notifier");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const opn = require("opn");
const argv = require("yargs").argv;

const defaultMaxPrice = 1400;
const interval = 5000;
const roomsEnum = ["", "one", "two", "three", "four"];
const previousIds = new Set();

async function readPage(olxUrl) {
  const response = await fetch(olxUrl);
  const text = await response.text();

  const $ = cheerio.load(text);

  let firstOffer;
  try {
    firstOffer = readOfferData($, 1);

    if (!firstOffer.id) {
      throw Error(`Id is null ${JSON.stringify(firstOffer)}`);
    }
  } catch (e) {
    console.error("Parsing template failed!", e);
    return;
  }

  /* Program just started */
  if (previousIds.length === 0) {
    console.log(`${getTime()} Program Start!`);
    previousIds.add(firstOffer.id);
    return;
  }

  /* No new offer */
  if (previousIds.has(firstOffer.id)) {
    console.log(
      `${getTime()} [${firstOffer.name}#${firstOffer.id}] No new offer...`
    );
    return;
  }

  console.log(`${getTime()} New Offer!!! `, firstOffer);
  sendNotification(
    `${firstOffer.name} ${firstOffer.price}`,
    firstOffer.location,
    firstOffer.url
  );
  previousIds.add(firstOffer.id);
}

function readOfferData($, offerIndex) {
  const index = offerIndex + 2;
  return {
    name: $(
      `#offers_table > tbody > tr:nth-child(${index}) .space.rel > h3`
    ).text(),
    price: $(
      `#offers_table > tbody > tr:nth-child(${index}) .td-price .price`
    ).text(),
    location: $(`#offers_table > tbody > tr:nth-child(${index}) .space.rel > p`)
      .text()
      .trim(),
    url: $(
      `#offers_table > tbody > tr:nth-child(${index}) .space.rel > h3 a`
    ).attr("href"),
    id: $(
      `#offers_table > tbody > tr:nth-child(${index}) > td > div > table`
    ).attr("data-id")
  };
}

function sendNotification(title, message, url) {
  console.log(
    `Sending a notification: {title: '${title}', message: '${message}}'`
  );
  const options = {
    title,
    message,
    sound: true,
    wait: true,
    type: "info"
  };

  notifier.notify(options);

  notifier.on("click", function(notifierObject, options) {
    opn(url);
  });
}

function getTime() {
  return new Date(Date.now()).toLocaleString().split(" ")[1];
}

function startRead() {
  function generateRoomQuery(roomsNumber) {
    return Array(roomsNumber + 1)
      .fill()
      .map((_, i) => `&search[filter_enum_rooms][0]=${roomsEnum[i + 1]}`);
  }

  const roomsQueryUrl = `${
    argv.rooms && argv.rooms < 5
      ? generateRoomQuery(argv.rooms)
      : "`&search[filter_enum_rooms][0]=one"
  }"`;
  const buildUrl = `https://www.olx.pl/nieruchomosci/mieszkania/wynajem/bialystok/?search[filter_float_price:to]=${
    argv.maxPrice ? argv.maxPrice : defaultMaxPrice
  }${roomsQueryUrl}`;
  setTimeout(async () => {
    await readPage(buildUrl);
  });

  setInterval(async () => {
    await readPage(buildUrl);
  }, interval);
}

startRead();
