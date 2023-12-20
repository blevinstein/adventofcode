
import fs from 'fs';

async function main() {
  const modules = Object.fromEntries(fs.readFileSync(process.argv[2]).toString().trim()
      .split('\n')
      .map(line => {
        const [ description, destinations ] = line.split(' -> ');

        let type;
        let name;
        if (description === 'broadcaster') {
          type = description;
          name = description;
        } else {
          type = description[0];
          name = description.slice(1);
        }
        return [ name, { type, destinations: destinations.split(', ') }];
      }));

  console.log(JSON.stringify(modules, null, 4));

  function allPaths(node, previous = []) {
    // Avoid cycles
    if (previous.includes(node)) return [[node, '...']];

    if (!modules[node]) return [[node]];

    const result = modules[node].destinations
        .flatMap(destination => allPaths(destination, previous.concat(node)))
        .map(tail => [node].concat(tail));
    //console.log({ node, resultLength: result.length, destinations: modules[node].destinations });
    return result;
  }

  for (let path of allPaths('broadcaster')) {
    console.log(path.map(node => {
      return (modules[node] && modules[node].type !== 'broadcaster' ? modules[node].type : '') + node;
    }).join(' -> '));
  }
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
