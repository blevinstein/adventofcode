
import fs from 'fs';

const vectors = [
  [1, 0], // right
  [0, 1], // down
  [-1, 0], // left
  [0, -1], // up
];

const characters = [ '>', 'v', '<', '^' ];

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function dist(a, b) {
  return sub(a, b).map(Math.abs).reduce((a, b) => a + b);
}

function mul(a, scalar) {
  return [a[0] * scalar, a[1] * scalar];
}

function div(a, scalar) {
  return [a[0] / scalar, a[1] / scalar];
}

function eq(a, b) {
  return a[0] == b[0] && a[1] == b[1];
}

function parseMoves(rawMoves) {
  let remainder = rawMoves.trim();
  let moves = [];
  while (remainder.length > 0) {
    if (remainder[0] == 'L' || remainder[0] == 'R') {
      moves.push(remainder[0]);
      remainder = remainder.slice(1);
    } else {
      const [numString] = /^\d+/.exec(remainder);
      remainder = remainder.slice(numString.length);
      moves.push(Number(numString));
    }
  }
  return moves;
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString();
  const [rawGrid, rawMoves] = rawInput.split('\n\n');

  const height = rawGrid.split('\n').length;
  const width = rawGrid.split('\n').map(line => line.length).reduce((a, b) => Math.max(a, b));

  const grid = new Map(rawGrid.split('\n').flatMap((line, y) =>
    line.split('').map((char, x) => [char, x])
        .filter(([char, x]) => char != ' ')
        .map(([char, x]) => [String([x, y]), char])
  ));

  const moves = parseMoves(rawMoves);

  // Find all positions along the edge, and the vectors that would lead off each edge. Some
  // positions are on multiple edges, but each (position, vector) tuple is only one a single edge.
  let edgePositions = [];
  for (let x = -1; x <= width; ++x) {
    for (let y = -1; y <= height; ++y) {
      if (grid.has(String([x,y]))) continue;
      for (let v of vectors) {
        if (grid.has(String(add([x, y], v)))) {
          edgePositions.push({ position: [x, y], vector: mul(v, -1) });
        }
      }
    }
  }

  // Group edge positions into continuous edges. Note that some of these 2D edges may constitute two
  // 3D edges after folding.
  let edgeGroups = [];
  while (edgePositions.length > 0) {
    const newEdge = [];
    const stack = [edgePositions.shift()];
    while (stack.length > 0) {
      const current = stack.pop();
      newEdge.push(current);
      for (let v of vectors) {
        const newPosition = add(current.position, v);
        const foundIndex = edgePositions.findIndex(e =>
            eq(e.position, newPosition) && eq(e.vector, current.vector));
        if (foundIndex >= 0) {
          // Add to stack and remove from edgePositions
          stack.push(edgePositions[foundIndex]);
          edgePositions.splice(foundIndex, 1);
        }
      }
    }
    edgeGroups.push(newEdge);
  }

  // Transform edge groups into simple objects with min/max coords
  let edges = edgeGroups.map(g => ({
    min: [
      g.map(p => p.position[0]).reduce((a, b) => Math.min(a, b)),
      g.map(p => p.position[1]).reduce((a, b) => Math.min(a, b)),
    ],
    max: [
      g.map(p => p.position[0]).reduce((a, b) => Math.max(a, b)),
      g.map(p => p.position[1]).reduce((a, b) => Math.max(a, b)),
    ],
    vector: g[0].vector
  }));

  // Split edges until all are the same length
  const sideLength = edges.map(e => dist(e.min, e.max) + 1).reduce((a, b) => Math.min(a, b));
  edges = edges.flatMap(e => {
    const len = dist(e.min, e.max) + 1;
    if (len == sideLength) {
      return [e];
    } else if (len % sideLength == 0) {
      const numParts = len / sideLength;
      const sideStep = sub(e.max, e.min).map(Math.sign);
      const sideVector = div(sub(add(e.max, sideStep), e.min), numParts);
      let newEdges = [];
      for (let p = 0; p < numParts; ++p) {
        newEdges.push({
          min: add(e.min, mul(sideVector, p)),
          max: sub(add(e.min, mul(sideVector, p + 1)), sideStep),
          vector: e.vector
        });
      }
      return newEdges;
    }
  });

  // Reorganize into a ring, where ring[i] and ring[i+1] share a vertex.
  // Add start/end points, which will correspond to min and max, but indicate the direction of the
  // ring.
  const firstEdge = edges.shift();
  const ring = [{
    ...firstEdge,
    start: firstEdge.min,
    end: firstEdge.max,
  }];
  let tick = 0;
  while (edges.length > 0) {
    if (++tick > 50) throw new Error('failed');
    const current = edges.shift();
    if (dist(ring[ring.length - 1].end, current.min) <= 2) {
      ring.push({
        ...current,
        start: current.min,
        end: current.max,
      });
    } else if (dist(ring[ring.length - 1].end, current.max) <= 2) {
      ring.push({
        ...current,
        start: current.max,
        end: current.min,
      });
    } else {
      edges.push(current);
    }
  }

  // Construct a "fold map", a symmetric map which specifies which edge (by ring index) maps to
  // which other edge.
  const foldMap = new Map;
  for (let i = 0; i < ring.length; ++i) {
    const isConcave = eq(ring[i].end, ring[(i+1) % ring.length].start);
    if (isConcave) {
      foldMap.set(i, i+1);
      foldMap.set(i+1, i);
      let stepsOut = 1;
      while (true) {
        let lowerStraight = eq(ring[(i-stepsOut+ring.length) % ring.length].vector, ring[(i-stepsOut+1) % ring.length].vector);
        let upperStraight = eq(ring[(i+stepsOut) % ring.length].vector, ring[(i+stepsOut+1) % ring.length].vector);
        if (lowerStraight != upperStraight) {
          if (foldMap.has(i - stepsOut) || foldMap.has(i + stepsOut + 1)) throw new Error('Folding failed');
          foldMap.set((i - stepsOut + ring.length) % ring.length, (i + stepsOut + 1) % ring.length);
          foldMap.set((i + stepsOut + 1) % ring.length, (i - stepsOut) % ring.length);
          stepsOut++;
        } else {
          break;
        }
      }
    }
  }

  // Construct a "wrap map", mapping from positions/vectors on one edge, to the new location where a
  // character would be relocated after wrapping off the edge at that position.
  const wrapMap = new Map;
  for (let i = 0; i < ring.length; ++i) {
    const edge = ring[i];
    const otherEdge = ring[foldMap.get(i)];
    const sideStep = sub(edge.end, edge.start).map(Math.sign);
    const otherSideStep = sub(otherEdge.start, otherEdge.end).map(Math.sign);
    for (let j = 0; j < sideLength; ++j) {
      const source = [add(edge.start, mul(sideStep, j)), edge.vector];
      const destVector = mul(otherEdge.vector, -1);
      const destDirection = vectors.findIndex(v => eq(v, destVector));
      const dest = [add(add(otherEdge.end, mul(otherSideStep, j)), destVector), destDirection];
      wrapMap.set(String(source), dest);
    }
  }

  // Moves one unit forward. If this results in leaving the grid, it returns the wrapped location on
  // the other side of the grid.
  function moveForward(position, direction) {
    let vector = vectors[direction];
    let newPosition = add(position, vector);
    let newDirection = direction;
    if (!grid.has(String(newPosition))) {
      [newPosition, newDirection] = wrapMap.get(String([newPosition, vectors[direction]]));
    }
    return [newPosition, newDirection];
  }

  // Run the simulation
  let position = [0, 0];
  let direction = 0;
  let path = new Map([[String(position), characters[direction]]]);
  while (!grid.has(String(position))) {
    position = [position[0] + 1, 0];
  }
  for (let move of moves) {
    if (typeof move == 'number') {
      for (let i = 0; i < move; ++i) {
        const [nextPosition, nextDirection] = moveForward(position, direction);
        if (grid.get(String(nextPosition)) == '.') {
          position = nextPosition;
          direction = nextDirection;
          path.set(String(position), characters[direction]);
        } else {
          break;
        }
      }
    } else if (move == 'R') {
      direction = (direction + 1) % 4; // Turn right
    } else {
      direction = (direction + 3) % 4; // Turn left
    }
    path.set(String(position), characters[direction]);
  }

  // Draw the grid
  function drawGrid() {
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        if (path.has(String([x,y]))) {
          process.stdout.write(path.get(String([x,y])));
        } else if (grid.has(String([x,y]))) {
          process.stdout.write('.');
        } else {
          process.stdout.write(' ');
        }
      }
      process.stdout.write('\n');
    }
  }
  drawGrid();

  console.log((position[0] + 1) * 4 + (position[1] + 1) * 1000 + direction);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
