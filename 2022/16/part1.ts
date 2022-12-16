
import fs from 'fs';

const maxMinutes = 30;

function valueOf(volcano, moves) {
  if (moves.length > maxMinutes) throw Error(`Too many moves: ${moves.length} > ${maxMinutes}`);
  let flow = 0;
  let totalFlow = 0;
  let position = 'AA';
  const openValves = new Set();
  for (let move of moves) {
    totalFlow += flow;
    if (move == 'open') {
      if (openValves.has(position)) throw Error(`Valve ${position} already open`);
      openValves.add(position);
      flow += volcano.get(position).flowRate;
    } else {
      if (!volcano.get(position).leadsTo.includes(move)) {
          throw Error(`Valve ${move} not reachable from ${position}`);
      }
      position = move;
    }
  }
  totalFlow += (maxMinutes - moves.length) * flow;
  return totalFlow;
}

function openValves(moves) {
  const openValves = [];
  let position = 'AA';
  for (let move of moves) {
    if (move == 'open') {
      openValves.push(position);
    } else {
      position = move;
    }
  }
  return openValves;
}

function lastPosition(moves) {
  if (moves.length == 0 || (moves.length == 1 && moves[0] == 'open')) {
    return 'AA';
  } else if (moves[moves.length - 1] == 'open') {
    return moves[moves.length - 2];
  } else {
    return moves[moves.length - 1];
  }
}

function recentlyVisited(moves) {
  const lastOpen = moves.lastIndexOf('open');
  return lastOpen >= 0 ? moves.slice(lastOpen + 1) : moves;
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
  let bestMovesValue = 0;
  const stack = [[]];

  await interruptableWhile(() => stack.length > 0, () => {
    if (tick++ > 0 && tick % 1e6 == 0) {
      console.log(`Tick ${tick} stack size ${stack.length} shuffle`);
      stack.sort((a, b) => Math.random() < 0.5 ? 1 : -1);
    }

    // BFS for the first thousand steps, then DFS to limit stack size
    const moves = tick < 1000 ? stack.shift() : stack.pop();
    const position = lastPosition(moves);
    const flow = totalFlow(volcano, openValves(moves));
    const visited = recentlyVisited(moves);
    const value = valueOf(volcano, moves);

    if (value > bestMovesValue) {
      //console.log(`Found ${value} (${typeof value}) > ${bestMovesValue} (${typeof bestMovesValue})`);
      bestMovesValue = value;
      bestMoves = moves;
      console.log(`Best moves (${bestMovesValue}, flow ${flow}/${maxFlow}, len ${bestMoves.length}): ${bestMoves}`);
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

    for (let nextPosition of volcano.get(position).leadsTo) {
      if (!visited.includes(nextPosition)) {
        stack.push(moves.concat([nextPosition]));
      }
    }
    if (!openValves(moves).includes(position) && volcano.get(position).flowRate > 0) {
      stack.push(moves.concat(['open']));
    }
  });

  console.log(`Final answer: ${bestMovesValue}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
