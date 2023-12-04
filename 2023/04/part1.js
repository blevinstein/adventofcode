
import fs from 'fs';

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString().trim();
  const points = rawInput.split('\n').map(line => {
    const [ label, data ] = line.split(/:\s*/);
    const [ winners, mine ] = data.split(/\s*\|\s*/).map(nums => nums.split(/\s+/).map(Number));
    const winCount = mine.filter(myNumber => winners.some(winner => myNumber === winner)).length;
    return winCount > 0 ? Math.pow(2, winCount - 1) : 0;
  }).reduce((a, b) => a + b);
  console.log(points);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
