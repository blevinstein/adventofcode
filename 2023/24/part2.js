
import fs from 'fs';

import { add3, sub3, mul3, range, magnitude, dot, cross, eq } from '../../common.js';

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

// Solve vector equation x + va * ta + vb * tb = 0, return [ta, tb]
function solveLinear(x, va, vb) {
  // If there is a zero in the matrix, use that to solve
  if (vb.some(el => el === 0)) {
    [vb, va] = [va, vb];
  }
  if (va.some(el => el === 0)) {
    const zIndex = va.findIndex(el => el === 0);
    const tb = -x[zIndex] / vb[zIndex];
    const otherIndex = 1 - zIndex;
    const ta = (-x[otherIndex] - vb[otherIndex]*tb) / va[otherIndex];
    return [ta, tb];
  }
  // Otherwise, use values from two rows to solve for ta
  // x[0] = va[0]*ta + vb[0]*tb
  // x[1] = va[1]*ta + vb[1]*tb
  // x[1]*vb[0]/vb[1] = va[1]*vb[0]/vb[1]*ta + vb[0]*tb
  // x[0] - vb[0]/vb[1]*x[1] = va[0]*ta - va[1]*vb[0]/vb[1]*ta
  // ta = (x[0] - vb[0]/vb[1]*x[1]) / (va[0] - va[1]*vb[0]/vb[1])
  const ta = (x[0] - vb[0]/vb[1]*x[1]) / (va[0] - va[1]*vb[0]/vb[1]);
  // Then use any row to solve for tb
  const tb = (-x[2] - va[2]*ta) / va[2];
  return [ta, tb];
}

// Helper functions for converting between [Number] and [BigInt]
function numberVec(v) {
  return v.map(coord => Number(coord));
}
function bigIntVec(v) {
  return v.map(coord => BigInt(coord));
}

async function main() {
  const stones = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(/\s+@\s+/).map(coords => bigIntVec(coords.split(/,\s+/))));

  // xc + vc * tc = center of mass
  const xc = bigIntVec(
      mul3(
          stones.map(stone => numberVec(stone[0])).reduce((a, b) => add3(a, b)),
          1 / stones.length)
      .map(coord => Math.round(coord)));
  const vc = bigIntVec(
      mul3(stones.map(
          stone => numberVec(stone[1])).reduce((a, b) => add3(a, b)),
          1 / stones.length)
      .map(coord => Math.round(coord)));

  // Generate a bunch of guesses for vs in a hypersphere around vc, then solve for xc based on
  // multiple points, fail when they don't match
  let counter = 0;
  let result;
  for (let g of guess3()) {
  //for (let vg of [[-3, 1, 2]]) {
    // Guess vec3 velocity, solve for times, use to calculate xg
    const vg = add3(bigIntVec(g), vc);

    let xZero, vZero, tZero;
    for (let i of range(stones.length - 1)) {
      let j = i + 1;
      // Combine two vector equations to remove xg, solve for ti and tj
      // xg + vg * ti = xi + vi * ti
      // xg + vg * tj = xj + vj * tj
      // vg * ti - vg * tj = xi - xj + vi * ti - vj * tj
      // 0 = (xi - xj) + (vi - vg) * ti + (vg - vj) * t2
      const [ ti, tj ] = solveLinear(
          numberVec(sub3(stones[i][0], stones[j][0])),
          numberVec(sub3(stones[i][1], vg)),
          numberVec(sub3(vg, stones[j][1])));
      // We only need one successful solution, and we can solve for xg
      //console.log({ ti, tj });
      if (isNaN(ti) || !isFinite(ti) || Math.round(ti) !== ti) continue;
      if (!isNaN(ti) && Math.round(ti) === ti && ti > 0) {
        [xZero, vZero] = stones[i];
        tZero = BigInt(ti);
        break;
      }
    }
    if (!xZero) continue;

    // Solve for xg
    // xg + vg * ti = xi + vi * ti for any i
    // xg = x0 + v0 * t0 - vg * t0
    const xg = sub3(add3(xZero, mul3(vZero, tZero)), mul3(vg, tZero));
    // Check the solution
    if (!eq( add3(xZero, mul3(vZero, tZero)), add3(xg, mul3(vg, tZero))))
        throw Error('Bad solution for xg');

    // Check if this would work for all other stones
    let done = true;
    for (let [xi, vi] of stones) {
      let xRel = sub3(xi, xg);
      let vRel = sub3(vi, vg);
      if (cross(xRel, vRel).some(c => c !== BigInt(0)) || dot(xRel, vRel) >= BigInt(0)) {
        // DEBUG
        if (++counter % 1e4 === 0)
          console.log({ vc, vg, xg, tZero, xZero, vZero, radius: g.map(c => Math.abs(c)).reduce((a, b) => a + b) });
        //xRel, vRel, dot: dot(xRel, vRel), cross: cross(xRel, vRel) });
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
