
import fs from 'fs';

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString().trim();
  const scores = rawInput.split('\n').map(line => {
    const [ label, data ] = line.split(/:\s*/);
    const [ winners, mine ] = data.split(/\s*\|\s*/).map(nums => nums.split(/\s+/).map(Number));
    return mine.filter(myNumber => winners.some(winner => myNumber === winner)).length;
  });
  //console.log({scores});
  const counts = scores.map(s => 1);
  for (let i = 0; i < scores.length; ++i) {
    for (let j = i + 1; j <= i + scores[i]; ++j) {
      counts[j] = (counts[j] || 1) + counts[i];
    }
    //console.log(counts)
  }
  console.log(counts.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
