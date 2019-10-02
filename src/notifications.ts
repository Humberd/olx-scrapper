import { notify } from 'node-notifier';
import { OfferEntity } from './_models/offer-entity';
import * as opn from 'opn';
import { Notification } from 'node-notifier/notifiers/toaster';
import { downloadImage, removeImage } from './image-saver';

export async function sendNotification(entity: OfferEntity) {
  const fileName = `${entity.id}.webp`;
  const localURL = await downloadImage(entity.image, fileName);

  console.log({localURL});

  const options: Notification = {
    title: entity.name,
    message: entity.price,
    icon: localURL,
    sound: true,
    wait: true,
  };

  notify(options, (err, response, metadata) => {
    const notificationClicked = typeof err === 'string';
    if (notificationClicked) {
      opn(entity.url);
    }

    removeImage(localURL)
  });
}
