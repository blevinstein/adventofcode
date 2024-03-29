
import fs from 'fs';
import { MaxPriorityQueue } from '@datastructures-js/priority-queue';

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
        throw new Error(`Valve ${positionA} is already open`);
      }
      openValves.add(positionA);
      flow += volcano.get(positionA).flowRate;
    } else if (moveA != 'noop') {
      if (!volcano.get(positionA).leadsTo.includes(moveA)) {
          throw Error(`Valve ${moveA} not reachable from ${positionA} in ${moves}`);
      }
      positionA = moveA;
    }

    if (moveB == 'open') {
      if (openValves.has(positionB)) {
        throw new Error(`Valve ${positionB} is already open`);
      }
      openValves.add(positionB);
      flow += volcano.get(positionB).flowRate;
    } else if (moveB != 'noop') {
      if (!volcano.get(positionB).leadsTo.includes(moveB)) {
          throw Error(`Valve ${moveB} not reachable from ${positionB} in ${moves}`);
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

function bestPossible(volcano, moves) {
  const opened = openValves(moves);
  const closedFlowRates = Array.from(volcano.entries()).filter(([name, data]) => !opened.includes(name) && data.flowRate > 0).map(([name, data]) => data.flowRate);
  closedFlowRates.sort((a, b) => b - a);
  let potentialValue = valueOf(volcano, moves);
  // NOTE: There is a bug here, we underestimate the possible flow because we assume that you can
  // only open one valve per minute, but you can actually open two valves per minute.
  for (let i = 0; i < maxMinutes - moves.length - 1 && i < closedFlowRates.length; ++i) {
    potentialValue += closedFlowRates[i] * (maxMinutes - moves.length - i - 1);
  }
  return potentialValue;
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
  const scoringFunction = moves => bestPossible(volcano, moves);

  // Use a priority queue to implement A* search
  const stack = new MaxPriorityQueue(scoringFunction);
  stack.enqueue([]);
  await interruptableWhile(() => stack.size() > 0, () => {
    if (tick++ > 0 && tick % 1e5 == 0) {
      console.log(`Tick ${tick} stack size ${stack.size()} approx value ${approxValue.toFixed(2)}`);
    }

    const moves = stack.dequeue();
    const [positionA, positionB] = lastPosition(moves);
    const flow = totalFlow(volcano, openValves(moves));
    const [visitedA, visitedB] = recentlyVisited(moves);
    const value = valueOf(volcano, moves);
    const doneA = moves.map(m => m[0]).includes('noop');
    const doneB = moves.map(m => m[1]).includes('noop');
    const stateToValue = new Map();

    approxValue = 0.01 * scoringFunction(moves) + 0.99 * approxValue;

    if (value > bestMovesValue) {
      //console.log(`Found ${value} (${typeof value}) > ${bestMovesValue} (${typeof bestMovesValue})`);
      bestMovesValue = value;
      bestMoves = moves;
      console.log(`Best moves (${bestMovesValue}, flow ${flow}/${maxFlow}, len ${bestMoves.length}): ${bestMoves.map(move => move.join('/'))}`);
    }

    if (moves.length == maxMinutes - 1) {
      // Time has run out
      return;
    } else if (flow == maxFlow) {
      // All non-zero valves are open
      return;
    } else if ((maxMinutes - moves.length - 1) * (maxFlow - flow) + value < bestMovesValue) {
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
        // If both players noop, we will not improve on the previous solution
        if (nextMoveA == 'noop' && nextMoveB == 'noop') continue;
        // Both players cannot open the same valve at the same time
        if (positionA == positionB && nextMoveA == 'open' && nextMoveB == 'open') continue;
        // Arbitrary choice of parity, to avoid exploring solutions twice
        if (moves.every(([a, b]) => a == b) && nextMoveA < nextMoveB) continue;

        stack.enqueue(moves.concat([[nextMoveA, nextMoveB]]));
      }
    }
  });

  console.log(`Final answer: ${bestMovesValue}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
