
import fs from 'fs';

async function main() {
  const [ times, distances ] = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(':')[1].trim().split(/\s+/).map(s => Number(s)));;
  let result = 1;
  for (let i = 0; i < distances.length; ++i) {
    const time = times[i];
    const distance = distances[i] + 1;
    // solution = (time +- sqrt(time^2 - 4*distance))/2
    const q = time * time - 4 * distance;
    if (q < 0) throw Error('No real solutions');
    const min = Math.ceil((time - Math.sqrt(q))/2);
    const max = Math.floor((time + Math.sqrt(q))/2);
    const ways = max - min + 1;
    console.log({time, distance, min, max, ways});
    result *= ways;
  }
  console.log(result);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
