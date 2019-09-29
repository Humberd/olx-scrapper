import { JSDOM } from 'jsdom';
import { OfferEntity } from './_models/offer-entity';

export async function getEntities(url: string): Promise<OfferEntity[]> {
  const response = await JSDOM.fromURL(url);
  const dom = JSDOM.fragment(response.serialize());

  return Array.from(dom.querySelectorAll('.offer-wrapper'))
      .map((offer: HTMLElement) => getEntity(offer));
}

function getEntity(offer: HTMLElement): OfferEntity {
  return {
    id: offer.querySelector('table').dataset.id,
    name: offer.querySelector('.title-cell a.linkWithHash').textContent.trim(),
    url: offer.querySelector('.title-cell a.linkWithHash').attributes.getNamedItem('href').value,
    price: offer.querySelector('.price').textContent.trim(),
    image: offer.querySelector('a.linkWithHash > img').attributes.getNamedItem('src').value
  };
}
