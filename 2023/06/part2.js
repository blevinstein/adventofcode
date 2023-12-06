
import fs from 'fs';

async function main() {
  const [ time, distance ] = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      Number(line.split(':')[1].trim().replaceAll(/\s+/g, '')));;
  console.log({ time, distance });
  // solution = (time +- sqrt(time^2 - 4*distance))/2
  const q = time * time - 4 * distance;
  if (q < 0) throw Error('No real solutions');
  const min = Math.ceil((time - Math.sqrt(q))/2);
  const max = Math.floor((time + Math.sqrt(q))/2);
  const ways = max - min + 1;
  console.log({time, distance, min, max, ways});
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
