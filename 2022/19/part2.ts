
import fs from 'fs';
import { MaxPriorityQueue } from '@datastructures-js/priority-queue';

function interruptableWhile(condition, innerBlock) {
  return new Promise(async (resolve, reject) => {
    async function cycle() {
      if (await condition()) {
        await innerBlock();
        setImmediate(cycle);
      } else {
        resolve();
      }
    }

    await cycle();
  });
}

function interruptableFor(condition, step, innerBlock) {
  return new Promise(async (resolve, reject) => {
    async function cycle() {
      if (await condition()) {
        await innerBlock();
        await step();
        setImmediate(cycle);
      } else {
        resolve();
      }
    }

    await cycle();
  });
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const blueprints = rawInput.split('\n').slice(0, 3).map(blueprint => {
    const parts = blueprint.split(/[:.]\s*/);
    const id = Number(parts[0].split(' ')[1]);
    const recipes = new Map;
    for (let i = 1; i < parts.length; ++i) {
      if (parts[i].length == 0) continue;
      const [_, output, allInputs] = /Each (\w+ robot) costs (.*)/.exec(parts[i]);
      const inputs = allInputs.split(' and ').map(inputStr => {
        const [amountStr, type] = inputStr.split(' ');
        return { amount: Number(amountStr), type };
      });
      recipes.set(output, inputs);
    }
    return { id, recipes };
  });

  const maxTime = 32;

  function maxPossibleGeodes(state) {
    const remainingTime = maxTime - state.time;
    return state['geode'] + remainingTime * (state['geode robot'] || 0) + remainingTime * (remainingTime - 1) / 2;
  }

  function totalRobots(state) {
    return (state['ore robot'] || 0) + (state['clay robot'] || 0) + (state['obsidian robot'] || 0);
  }

  function totalResources(state) {
    return (state['ore'] || 0) + (state['clay'] || 0) + (state['obsidian'] || 0);
  }

  let qualityLevel = 1;
  for (let blueprint of blueprints) {
    console.log(`Blueprint ${blueprint.id}`);
    for (let recipe of blueprint.recipes) {
      console.log(recipe);
    }

    let maxNeeded = {};
    for (let resource of ['ore', 'clay', 'obsidian']) {
      const robot = resource + ' robot';
      maxNeeded[robot] = Array.from(blueprint.recipes.values()).map(inputs => {
        const input = inputs.find(i => i.type == resource)
        return input ? input.amount : 0;
      }).reduce((a, b) => Math.max(a, b));
    }
    console.log(`Max needed: ${JSON.stringify(maxNeeded)}`);

    let mostGeodes = 0;
    //const scoringFunction = s => maxPossibleGeodes(s) + totalRobots(s) / 1e3 + totalResources(s) / 1e6;
    const stateToStr = state => String([
        state['ore'], state['clay'], state['obsidian'], state['geode'],
        state['ore robot'], state['clay robot'], state['obsidian robot'], state['geode robot'],
        state['time']]);
    const visited = new Set;
    const stack = new MaxPriorityQueue(maxPossibleGeodes);
    stack.enqueue({'ore robot': 1, time: 0});
    let tick = 0;
    let done = false;
    await interruptableWhile(() => stack.size() > 0 && !done, () => {
      const current = stack.dequeue();
      if (visited.has(stateToStr(current))) {
        return;
      } else {
        visited.add(stateToStr(current));
      }

      if (++tick % 1e5 == 0) {
        console.log(`Tick ${tick} stack size ${stack.size()} sample ${JSON.stringify(current)} score ${maxPossibleGeodes(current)}`);
      }

      let totalGeodes = current.geode + current['geode robot'] * (maxTime - current.time);
      if (totalGeodes > mostGeodes) {
        mostGeodes = totalGeodes;
        console.log(`Most geodes: ${mostGeodes} ${JSON.stringify(current)}`);
      }

      if (current.time >= maxTime) return;

      if (maxPossibleGeodes(current) < mostGeodes) done = true;

      const basicState = {
        ...current,
        time: current.time + 1,
        ore: (current.ore || 0) + (current['ore robot'] || 0),
        clay: (current.clay || 0) + (current['clay robot'] || 0),
        obsidian: (current.obsidian || 0) + (current['obsidian robot'] || 0),
        geode: (current.geode || 0) + (current['geode robot'] || 0),
      };
      // Option 1: don't produce any new robots
      stack.push(basicState);
      // Option 2: produce a new robot
      chooseRobot: for (let [robot, inputs] of blueprint.recipes.entries()) {
        const buildState = { ...basicState };

        // Building any more robots of this type is useless
        if (robot != 'geode robot' && current[robot] >= maxNeeded[robot]) continue;

        for (let { amount, type } of inputs) {
          if (current[type] >= amount) {
            buildState[type] = (buildState[type] || 0) - amount;
          } else {
            continue chooseRobot;
          }
        }
        buildState[robot] = (buildState[robot] || 0) + 1;
        stack.push(buildState);
      }
    });
    console.log(`Blueprint ${blueprint.id} score ${mostGeodes}`);
    qualityLevel *= mostGeodes;
  }
  console.log(`Quality level ${qualityLevel}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
