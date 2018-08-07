const WindowsToaster = require('node-notifier').WindowsToaster;
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const opn = require('opn');

const olxUrl = 'https://www.olx.pl/nieruchomosci/mieszkania/wynajem/bialystok/?search[filter_float_price:to]=1400&search[filter_enum_rooms][0]=one&search[filter_enum_rooms][1]=two';

async function parsePage() {
  const response = await fetch(olxUrl);
  const text = await response.text();

  const $ = cheerio.load(text);
  const offerName =
      $('#offers_table > tbody > tr:nth-child(2) > td > div > table > tbody > tr:nth-child(1) > td.title-cell > div > h3 > a > strong')
          .text();
  const offerPrice =
      $('#offers_table > tbody > tr:nth-child(2) > td > div > table > tbody > tr:nth-child(1) > td.wwnormal.tright.td-price > div > p > strong')
          .text();
  const offerLocation =
      $('#offers_table > tbody > tr:nth-child(2) > td > div > table > tbody > tr:nth-child(2) > td.bottom-cell > div > p > small:nth-child(1) > span')
          .text()
          .trim();
  const offerUrl =
      $('#offers_table > tbody > tr:nth-child(2) > td > div > table > tbody > tr:nth-child(1) > td.title-cell > div > h3 > a')
          .attr('href');

  sendNotification(`${offerName} ${offerPrice}`, offerLocation, offerUrl);
}

function sendNotification(title, message, url) {
  const options = {
    title,
    message,
    sound: true,
    wait: true,
    type: 'info',
  };

  new WindowsToaster().notify(options, (error, response) => {
    console.log(response);
    opn(url);
  });
}

setTimeout(async () => {
  await parsePage();
});

// sendNotification("Foo", "bar", "http://tibia.com/");