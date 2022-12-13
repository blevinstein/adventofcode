
import { lessThan } from './common';

async function main() {
  const a = JSON.parse(process.argv[2]);
  const b = JSON.parse(process.argv[3]);
  if (!lessThan(a, b)) {
    console.log(`Out of order: ${JSON.stringify(a)} >= ${JSON.stringify(b)}`);
  } else {
    console.log(`In order: ${JSON.stringify(a)} < ${JSON.stringify(b)}`);
  }
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
