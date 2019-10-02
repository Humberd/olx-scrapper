const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

const IMAGES_PATH = '../images';

export function downloadImage(url: string, fileName: string) {
  return fetch(url)
      .then(res => {
        const absPath = path.join(__dirname, IMAGES_PATH, fileName);
        const dest = fs.createWriteStream(absPath);
        res.body.pipe(dest);

        return absPath;
      });
}

export function removeImage(path: string) {
  return fs.removeSync(path)
}
