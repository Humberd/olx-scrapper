import { getEntities } from './dom-parser';
import { sendNotification } from './notifications';
import { OfferEntity } from './_models/offer-entity';
import { Visited } from './visited';

const olxUrl = 'https://www.olx.pl/nieruchomosci/mieszkania/wynajem/warszawa/?search[filter_enum_builttype][0]=apartamentowiec&search[filter_enum_rooms][0]=one&search[filter_enum_rooms][1]=two&search[district_id]=353';
const interval = 5000;

const visited = new Visited();

async function tick(firstRun: boolean) {
  const entities = (await getEntities(olxUrl)).reverse();

  let filteredEntities: OfferEntity[];
  if (firstRun) {
    filteredEntities = [];
    saveVisited(entities);
  } else {
    filteredEntities = filterVisited(entities);
    saveVisited(filteredEntities);
  }

  console.log(`${filteredEntities.length} new offers`);


  for (const filteredEntity of filteredEntities) {
    console.log(filteredEntity);
    await sendNotification(filteredEntity);
  }
}

function filterVisited(entities: OfferEntity[]): OfferEntity[] {
  return entities.filter(entity => !visited.has(entity.id));
}

function saveVisited(entities: OfferEntity[]) {
  for (const entity of entities) {
    visited.add(entity.id);
  }
}

setTimeout(async () => {
  await visited.init();
  await tick(true);
});

setInterval(async () => {
  await tick(false);
}, interval);
