const WindowsToaster = require('node-notifier').WindowsToaster;
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const opn = require('opn');

const olxUrl = 'https://www.olx.pl/nieruchomosci/mieszkania/wynajem/warszawa/?search[filter_enum_builttype][0]=apartamentowiec&search[filter_enum_rooms][0]=one&search[filter_enum_rooms][1]=two&search[district_id]=353';
const interval = 5000;

const previousIds = new Set();

async function readPage() {
  const response = await fetch(olxUrl);
  const text = await response.text();

  const $ = cheerio.load(text);

  let firstOffer;
  try {
    firstOffer = readOfferData($, 0);

    if (!firstOffer.id) {
      throw Error(`Id is null ${firstOffer}`)
    }
  } catch (e) {
    console.error('Parsing template failed!', e);
    return
  }

  /* Program just started */
  if (previousIds.length === 0) {
    console.log(`${getTime()} Program Start!`);
    previousIds.add(firstOffer.id);
    return;
  }

  /* No new offer */
  if (previousIds.has(firstOffer.id)) {
    console.log(`${getTime()} [${firstOffer.name}#${firstOffer.id}] No new offer...`);
    return;
  }

  console.log(`${getTime()} New Offer!!! `, firstOffer);
  sendNotification(`${firstOffer.name} ${firstOffer.price}`, firstOffer.location, firstOffer.url);
  previousIds.add(firstOffer.id)
}

function readOfferData($, offerIndex) {
  const index = offerIndex + 2;
  return {
    name:
        $(`#offers_table > tbody > tr:nth-child(${index}) > td > div > table > tbody > tr:nth-child(1) > td.title-cell > div > h3 > a > strong`)
            .text(),
    price:
        $(`#offers_table > tbody > tr:nth-child(${index}) > td > div > table > tbody > tr:nth-child(1) > td.wwnormal.tright.td-price > div > p > strong`)
            .text(),
    location:
        $(`#offers_table > tbody > tr:nth-child(${index}) > td > div > table > tbody > tr:nth-child(2) > td.bottom-cell > div > p > small:nth-child(1) > span`)
            .text()
            .trim(),
    url:
        $(`#offers_table > tbody > tr:nth-child(${index}) > td > div > table > tbody > tr:nth-child(1) > td.title-cell > div > h3 > a`)
            .attr('href'),
    id:
        $(`#offers_table > tbody > tr:nth-child(${index}) > td > div > table`)
            .attr('data-id')
  };
}

function sendNotification(title, message, url) {
  console.log(`Sending a notification: {title: '${title}', message: '${message}}'`);
  const options = {
    title,
    message,
    sound: true,
    wait: true,
    type: 'info',
  };

  new WindowsToaster().notify(options, (error, response) => {
    console.log(response);
    if (response === 'the user clicked on the toast.') {
      opn(url);
    }
  });
}

function getTime() {
  return new Date(Date.now()).toLocaleString().split(' ')[1]
}

setTimeout(async () => {
  await readPage()
});

setInterval(async () => {
  await readPage();
}, interval);
