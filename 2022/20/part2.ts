
import fs from 'fs';

function positiveMod(x, y) {
  let positive = x < 0 ? x + y * Math.ceil(Math.abs(x) / y) : x;
  if (positive < 0) throw new Error(`Positive mod failed: ${x} ${y} ${positive}`);
  return positive % y;
}

const decryptionKey = 811589153;

function mix(input, times) {
  let list = Array.from(input);

  let mixMap = new Map;
  let reverseMixMap = new Map;
  const getPosition = (index) =>
      (mixMap.get(index) !== undefined ? mixMap.get(index) : index);
  const getIndex = (position) =>
      (reverseMixMap.get(position) !== undefined ? reverseMixMap.get(position) : position);
  const setIndexPosition = (index, position) => {
    //console.log(`Map ${index} to ${position}`);
    mixMap.set(index, position);
    reverseMixMap.set(position, index);
  };

  //console.log(list);
  for (let step = 0; step < times; ++step) {
    for (let i = 0; i < input.length; ++i) {
      const value = input[i];
      const currentPosition = getPosition(i);
      // Sanity check
      if (list[currentPosition] != value) throw new Error(`Mix map out-of-sync, expected ${value}(${i}) at position ${currentPosition}`);
      const newPosition = (positiveMod(currentPosition + value - 1, input.length - 1) + 1) % input.length;
      if (newPosition > currentPosition) {
        //console.log(`Move ${value}(${i}) up from ${currentPosition} to ${newPosition}`);
        for (let j = currentPosition + 1; j <= newPosition; ++j) {
          setIndexPosition(getIndex(j), j - 1);
        }
        const parts = [
            list.slice(0, currentPosition),
            list.slice(currentPosition + 1, newPosition + 1),
            [value],
            list.slice(newPosition + 1)];
        list = [].concat(...parts);
      } else if (newPosition < currentPosition) {
        //console.log(`Move ${value}(${i}) down from ${currentPosition} to ${newPosition}`);
        for (let j = currentPosition - 1; j >= newPosition; --j) {
          setIndexPosition(getIndex(j), j + 1);
        }
        const parts = [
            list.slice(0, newPosition),
            [value],
            list.slice(newPosition, currentPosition),
            list.slice(currentPosition + 1)
        ];
        list = [].concat(...parts);
      } else {
        //console.log(`Do not move value ${value}(${i})`);
      }
      setIndexPosition(i, newPosition);
      //console.log(list);
      // Sanity check
      if (list[newPosition] != value) throw new Error(`Rotation failed, expected ${value} at position ${newPosition}`);
    }
    console.log(list);
  }
  return list;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const input = rawInput.split('\n').map(Number).map(n => n * decryptionKey);

  state = mix(input, 10);

  const zeroIndex = state.indexOf(0);
  console.log(state[(zeroIndex + 1000) % state.length] +
      state[(zeroIndex + 2000) % state.length] +
      state[(zeroIndex + 3000) % state.length]);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
