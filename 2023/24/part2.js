
import fs from 'fs';

import { add3, sub3, mul3, range, magnitude, dot, cross } from '../../common.js';

const DEG = 180 / Math.PI;

// Rotate vec2 by 90 deg
export function rotate(v) {
  return [-v[1], v[0]];
}

export function* guess3() {
  let radius = 0;
  while (true) {
    for (let i = -radius; i <= radius; ++i) {
      for (let j = -(radius - Math.abs(i)); j <= radius - Math.abs(i); ++j) {
        if (Math.abs(i) + Math.abs(j) === radius) {
          yield [i, j, 0];
        } else {
          yield [i, j, -(radius - Math.abs(i) - Math.abs(j))];
          yield [i, j, radius - Math.abs(i) - Math.abs(j)];
        }
      }
    }
    radius++;
  }
}

export function* guess4() {
  let radius = 0;
  while (true) {
    for (let i = -radius; i <= radius; ++i) {
      for (let j = -(radius - Math.abs(i)); j <= radius - Math.abs(i); ++j) {
        for (let k = -(radius - Math.abs(i) + Math.abs(j)); k <= radius - Math.abs(i) - Math.abs(j); ++k) {
          if (Math.abs(i) + Math.abs(j) + Math.abs(k) === radius) {
            yield [i, j, k, 0];
          } else {
            yield [i, j, k, -(radius - Math.abs(i) - Math.abs(j) - Math.abs(k))];
            yield [i, j, k, radius - Math.abs(i) - Math.abs(j) - Math.abs(k)];
          }
        }
      }
    }
    radius++;
  }
}

async function main() {
  const stones = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(/\s+@\s+/).map(coords => coords.split(/,\s+/).map(coord => Number(coord))));

  // xc + vc * tc = center of mass
  const xc = mul3(stones.map(stone => stone[0]).reduce((a, b) => add3(a, b)), 1 / stones.length)
      .map(coord => Math.round(coord));
  const vc = mul3(stones.map(stone => stone[1]).reduce((a, b) => add3(a, b)), 1 / stones.length)
      .map(coord => Math.round(coord));


  // Generate a bunch of guesses for vs in a hypersphere around vc, then solve for xc based on
  // multiple points, fail when they don't match
  let counter = 0;
  let result;
  for (let g of guess4()) {
    // Guess vec3 velocity and t_0, time when the first stone is collided with
    let vg = add3(g.slice(0, 3), vc);
    let tZero = g[3];
    if (tZero < 0) continue;
    let [ xZero, vZero ] = stones[0];

    // Solve for xg
    // xg = xi + vi * ti - vg * ti = xi + (vi - vg) * ti
    let xg = add3(xZero, mul3(sub3(vZero, vg), tZero));

    let done = true;
    for (let [xi, vi] of stones) {
      let xRel = sub3(xi, xg);
      let vRel = sub3(vi, vg);
      if (cross(xRel, vRel).some(c => c !== 0) || dot(xRel, vRel) > 0) {
        // DEBUG
        if (++counter % 1e6 === 0)
            console.log({ vg, xg, tZero, xRel, vRel, cross: cross(xRel, vRel) });
        done = false;
        break;
      }
    }
    if (done) {
      result = { xg, vg };
      break;
    }
  }

  console.log(result);
  console.log(result.xg.reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
