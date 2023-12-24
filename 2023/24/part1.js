
import fs from 'fs';

import { add2, sub2, mul2, range, magnitude, dot } from '../../common.js';

// Rotate vec2 by 90 deg
export function rotate(v) {
  return [-v[1], v[0]];
}

async function main() {
  const stones = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line =>
      line.split(/\s+@\s+/).map(coords => coords.split(/,\s+/).map(coord => Number(coord))));

  let result = 0;
  for (let i of range(stones.length)) {
    for (let j of range(i+1, stones.length)) {
      const [ xa, va ] = stones[i];
      const [ xb, vb ] = stones[j];
      // a = xa + va * ta
      // b = xb + va * tb

      // Unit vector perpendicular to each path
      const vbPerp = mul2(rotate(vb), 1 / magnitude(vb));
      const vaPerp = mul2(rotate(va), 1 / magnitude(va));

      // If a and b are parallel, no crossing
      if (dot(va, vbPerp) === 0) continue;

      // ta = component of (xb - xa) along vbPerp / component of va along vbPerp
      // same for b
      const ta = dot(sub2(xb, xa), vbPerp) / dot(va, vbPerp);
      const tb = dot(sub2(xa, xb), vaPerp) / dot(vb, vaPerp);

      let cross = add2(xa, mul2(va, ta));
      console.log({ i, j, cross, ta, tb });

      //const [ min, max ] = [ 7, 27 ];
      const [ min, max ] = [ 2e14, 4e14 ];

      if (ta >= 0 && tb >= 0
          && min <= cross[0] && cross[0] <= max
          && min <= cross[1] && cross[1] <= max) {
        result++;
      }
    }
  }
  console.log(result);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
