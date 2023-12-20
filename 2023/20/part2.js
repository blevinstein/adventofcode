
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

  const memory = {};
  for (let [ name, module ] of Object.entries(modules)) {
    if (module.type === 'broadcaster') continue;
    if (module.type === '%') {
      memory[name] = false;
    }
    if (module.type === '&') {
      memory[name] = Object.fromEntries(
          Object.entries(modules)
              .filter(([newName, newModule]) => newModule.destinations.includes(name))
              .map(([newName, newModule]) => [newName, false]));
    }
  }
  console.log({ modules, memory });

  let done = false;
  let buttonPresses = 0;

  while (!done) {
    buttonPresses++;

    //if (buttonPresses % 1e5 === 0) console.log(buttonPresses);
    console.log('press button');

    const pulses = [['broadcaster', false, null]];
    while (pulses.length > 0) {
      const [ address, level, source ] = pulses.shift();

      //console.log([ address, level, source ]);

      if (address === 'rx' && !level) done = true;

      // Eat signals to untyped modules
      if (!(address in modules)) continue;

      const { type, destinations } = modules[address];
      if (type === 'broadcaster') {
        for (let destination of destinations) {
          pulses.push([ destination, level, address ]);
        }
      } else if (type === '%') {
        // Respond to low pulses only
        if (!level) {
          memory[address] = !memory[address];
          console.log(`set ${address} = ${memory[address]}`);
          for (let destination of destinations) {
            pulses.push([ destination, memory[address], address ]);
          }
        }
      } else if (type === '&') {
        memory[address][source] = level;
        console.log(`remember ${source} -> ${address} = ${level}`);
        const outLevel = !Object.values(memory[address]).every(v => v);
        for (let destination of destinations) {
          pulses.push([ destination, outLevel, address ]);
        }
      }
    }
  }

  console.log({ buttonPresses });
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
