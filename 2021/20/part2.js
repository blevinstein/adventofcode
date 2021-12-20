
const fs = require('fs');

const DEBUG = true;

function get(image, x, y, border) {
  if (0 <= x && x < image[0].length && 0 <= y && y < image.length) {
    return image[y][x];
  }
  return border;
}

function patch(image, x, y, border) {
  let result = 0;
  for (let j = y - 1; j <= y + 1; ++j) {
    for (let i = x - 1; i <= x + 1; ++i) {
      result = (result << 1) | get(image, i, j, border);
    }
  }
  if (result < 0 || result >= 512) throw Error(`Bad patch: ${result}`);
  return result;
}

function enhance(image, border, algorithm) {
  const newImage = [];
  for (let y = -1; y <= image.length; ++y) {
    const newRow = [];
    for (let x = -1; x <= image[0].length; ++x) {
      newRow.push(algorithm[patch(image, x, y, border)]);
    }
    newImage.push(newRow);
  }
  newBorder = algorithm[border ? 0x1ff : 0];
  return [newImage, newBorder];
}

function showImage(image) {
  for (let y = 0; y < image.length; ++y) {
    for (let x = 0; x < image[0].length; ++x) {
      process.stdout.write(image[y][x] == 1 ? '#' : '.');
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');
}

function countPixels(image) {
  return image.map(row => row.reduce((a, b) => a + b)).reduce((a, b) => a + b);
}

async function main() {
  let [algorithm, input] = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n\n')
      .map(part => part.split('\n')
          .map(line => Array.from(line).map(c => c == '#' ? 1 : 0)));
  algorithm = algorithm[0];
  if (algorithm.length != 512) throw Error('Bad algorithm');

  let image = input;
  let border = 0;
  for (let i = 0; i < 50; ++i) {
    [image, border] = enhance(image, border, algorithm);
  }
  showImage(image);
  console.log(`Size=${image[0].length},${image.length}`);
  console.log(`Count=${countPixels(image)}`);
  console.log('Done');
}

main();
