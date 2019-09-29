import { notify } from 'node-notifier';
import { OfferEntity } from './_models/offer-entity';
import * as opn from 'opn';
import { Notification } from 'node-notifier/notifiers/toaster';

const path = require('path');


export function sendNotification(entity: OfferEntity) {
  const options: Notification = {
    title: entity.name,
    message: entity.price,
    icon: path.join(__dirname, '../image.webp'),
    sound: true,
    wait: true,
  };

  notify(options, (err, response, metadata) => {
    const notificationClicked = typeof err === 'string';
    if (notificationClicked) {
      opn(entity.url);
    }
  });
}
