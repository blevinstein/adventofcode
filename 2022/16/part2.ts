
import fs from 'fs';
import PriorityQueue from 'js-priority-queue';

const maxMinutes = 26;

function valueOf(volcano, moves) {
  if (moves.length > maxMinutes) throw Error(`Too many moves: ${moves.length} > ${maxMinutes}`);
  let flow = 0;
  let totalFlow = 0;
  let positionA = 'AA';
  let positionB = 'AA';
  const openValves = new Set();
  let minute = 0;
  for (let [moveA, moveB] of moves) {
    totalFlow += flow;
    //console.log(`Minute ${++minute} Flow ${flow} Total flow ${totalFlow}`);

    if (moveA == 'open') {
      if (openValves.has(positionA)) {
        // Both attempting to open the same valve simultaneously
        return -1;
      }
      openValves.add(positionA);
      flow += volcano.get(positionA).flowRate;
    } else if (moveA != 'noop') {
      if (!volcano.get(positionA).leadsTo.includes(moveA)) {
          throw Error(`Valve ${moveA} not reachable from ${positionA}`);
      }
      positionA = moveA;
    }

    if (moveB == 'open') {
      if (openValves.has(positionB)) {
        // Both attempting to open the same valve simultaneously
        return -1;
      }
      openValves.add(positionB);
      flow += volcano.get(positionB).flowRate;
    } else if (moveB != 'noop') {
      if (!volcano.get(positionB).leadsTo.includes(moveB)) {
          throw Error(`Valve ${moveB} not reachable from ${positionB}`);
      }
      positionB = moveB;
    }
  }
  totalFlow += (maxMinutes - moves.length) * flow;
  return totalFlow;
}

function openValves(moves) {
  const openValves = [];
  let positionA = 'AA';
  let positionB = 'AA';
  for (let [moveA, moveB] of moves) {
    if (moveA == 'open') {
      openValves.push(positionA);
    } else if (moveA != 'noop') {
      positionA = moveA;
    }
    if (moveB == 'open') {
      openValves.push(positionB);
    } else if (moveB != 'noop') {
      positionB = moveB;
    }
  }
  return openValves;
}

function lastPosition(moves) {
  let positionA = null;
  let positionB = null;
  for (let i = moves.length - 1; i >= 0; --i) {
    const [moveA, moveB] = moves[i];
    if (!positionA && moveA != 'open' && moveA != 'noop') {
      positionA = moveA;
    }
    if (!positionB && moveB != 'open' && moveB != 'noop') {
      positionB = moveB;
    }
    if (positionA && positionB) {
      return [positionA, positionB];
    }
  }
  return [positionA || 'AA', positionB || 'AA'];
}

function recentlyVisited(moves) {
  const lastOpenA = moves.map(m => m[0]).lastIndexOf('open');
  const lastOpenB = moves.map(m => m[1]).lastIndexOf('open');
  return [
    (lastOpenA >= 0 ? moves.slice(lastOpenA + 1) : moves).map(m => m[0]).filter(m => m != 'noop'),
    (lastOpenB >= 0 ? moves.slice(lastOpenB + 1) : moves).map(m => m[1]).filter(m => m != 'noop'),
  ];
}

function totalFlow(volcano, valves) {
  return valves.map(v => volcano.get(v).flowRate).reduce((a, b) => a + b, 0);
}

function interruptableWhile(condition, innerBlock) {
  return new Promise((resolve, reject) => {
    function cycle() {
      if (condition()) {
        innerBlock();
        setImmediate(cycle);
      } else {
        resolve();
      }
    }

    cycle();
  });
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const volcano = new Map(rawInput.split('\n').map(line => {
    const [_, valve, flowRateStr, leadsToStr] =
        /Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? ([\w\s,]*)/.exec(line);
    return [valve, { flowRate: Number(flowRateStr), leadsTo: leadsToStr.split(', ') }];
  }));

  const maxFlow = Array.from(volcano.values()).map(v => v.flowRate).reduce((a, b) => a + b);

  let tick = 0;
  let bestMoves = null;
  let bestMovesValue = -1;
  let approxValue = 0;
  const stack = [[]];
  interruptableWhile(() => stack.length, () => {
    if (tick++ > 0 && tick % 1e6 == 0) {
      console.log(`Tick ${tick} stack size ${stack.length} approx value ${approxValue}`);
      stack.sort((a, b) => Math.random() < 0.5 ? 1 : -1);
    }

    // BFS for the first hundred steps, then DFS to limit stack size
    const moves = tick < 100 ? stack.shift() : stack.pop();
    const [positionA, positionB] = lastPosition(moves);
    const flow = totalFlow(volcano, openValves(moves));
    const [visitedA, visitedB] = recentlyVisited(moves);
    const value = valueOf(volcano, moves);
    const doneA = moves.map(m => m[0]).includes('noop');
    const doneB = moves.map(m => m[1]).includes('noop');
    const stateToValue = new Map();

    approxValue = 0.01 * value + 0.99 * approxValue;

    if (value > bestMovesValue) {
      //console.log(`Found ${value} (${typeof value}) > ${bestMovesValue} (${typeof bestMovesValue})`);
      bestMovesValue = value;
      bestMoves = moves;
      console.log(`Best moves (${bestMovesValue}, flow ${flow}/${maxFlow}, len ${bestMoves.length}): ${JSON.stringify(bestMoves)}`);
    }

    if (moves.length == maxMinutes) {
      // Time has run out
      return;
    } else if (flow == maxFlow) {
      // All non-zero valves are open
      return;
    } else if ((maxMinutes - moves.length) * (maxFlow - flow) + value < bestMovesValue) {
      // Terminate early, we cannot beat the best solution so far
      return;
    }

    let nextMovesA = ['noop'];
    if (!doneA) {
      for (let nextPositionA of volcano.get(positionA).leadsTo) {
        if (!visitedA.includes(nextPositionA)) {
          nextMovesA.push(nextPositionA);
        }
      }
      if (!openValves(moves).includes(positionA) && volcano.get(positionA).flowRate > 0) {
        nextMovesA.push('open');
      }
    }

    let nextMovesB = ['noop'];
    if (!doneB) {
      for (let nextPositionB of volcano.get(positionB).leadsTo) {
        if (!visitedB.includes(nextPositionB)) {
          nextMovesB.push(nextPositionB);
        }
      }
      if (!openValves(moves).includes(positionB) && volcano.get(positionB).flowRate > 0) {
        nextMovesB.push('open');
      }
    }

    for (let nextMoveA of nextMovesA) {
      for (let nextMoveB of nextMovesB) {
        if (nextMoveA != 'noop' || nextMoveB != 'noop') {
          stack.push(moves.concat([[nextMoveA, nextMoveB]]));
        }
      }
    }
  });

  console.log(`Final answer: ${bestMovesValue}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
