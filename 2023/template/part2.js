
import fs from 'fs';

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString().trim();
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
