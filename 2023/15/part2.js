
import fs from 'fs';

function hash(string) {
  let value = 0;
  for (let c of string) {
    value = (value + c.charCodeAt(0)) * 17 % 256;
  }
  return value;
}

async function main() {
  const operations = fs.readFileSync(process.argv[2]).toString().trim().split(',')
      .map(line => line.match(/([a-zA-Z]+)([-=])(\d*)/).slice(1));
  const boxes = {};
  for (let [label, operand, numString] of operations) {
    const key = hash(label);
    if (operand === '-') {
      boxes[key] = (boxes[key] || []).filter(lens => lens.label !== label);
    } else {
      const existingIndex = (boxes[key] || []).findIndex(lens => lens.label === label);
      if (existingIndex >= 0) {
        boxes[key][existingIndex] = { label, num: Number(numString) };
      } else {
        boxes[key] = (boxes[key] || []).concat({ label, num: Number(numString) });
      }
    }
    //console.log({ label, operand, numString });
    //console.log(boxes);
  }
  console.log(boxes);

  console.log(Object.entries(boxes)
      .flatMap(([boxNumString, box]) => box
          .map(({ label, num }, slotNumber) => (1 + Number(boxNumString)) * (1 + slotNumber) * num))
      .reduce((a, b) => a + b));
  //console.log(rawInput.map(part => hash(part)).reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
