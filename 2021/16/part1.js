
const fs = require('fs');

const DEBUG = false;

function bits(hex) {
  return Array.from(hex)
      .map(c => parseInt(c, 16))
      .flatMap(v => [(v & 1<<3)>>3, (v & 1<<2)>>2, (v & 1<<1)>>1, v & 1]);
}

function value(bits) {
  const result = bits.reduce((a, b) => a*2 + b, 0);
  return result;
}

function parse(bits) {
  const version = value(bits.slice(0, 3));
  const type = value(bits.slice(3, 6));
  if (DEBUG) console.log(`version=${version} type=${type}`);
  let pos = 6;
  if (type == 4) {
    // Parse literal
    let valueBits = [];
    while (true) {
      valueBits = valueBits.concat(bits.slice(pos+1, pos+5));
      if (bits[pos]) {
        pos += 5;
      } else {
        pos += 5;
        break;
      }
    }
    return { version, type, value: value(valueBits), size: pos };
  } else {
    const lengthType = bits[pos++];
    if (lengthType == 1) {
      const numSubPackets = value(bits.slice(pos, pos + 11));
      pos += 11;
      if (DEBUG) console.log(`recurse numSubPackets=${numSubPackets}`);
      const subPackets = [];
      for (let i = 0; i < numSubPackets; ++i) {
        const subPacket = parse(bits.slice(pos));
        pos += subPacket.size;
        subPackets.push(subPacket);
        if (DEBUG) console.log(`subPacket=${JSON.stringify(subPacket)}`);
      }
      if (DEBUG) console.log('/recurse');
      return { version, type, subPackets, size: pos };
    } else {
      const lengthSubPackets = value(bits.slice(pos, pos + 15));
      pos += 15;
      if (DEBUG) console.log(`recurse lengthSubPackets=${lengthSubPackets}`);
      const startPos = pos;
      const subPackets = [];
      while (pos - startPos < lengthSubPackets) {
        const subPacket = parse(bits.slice(pos));
        pos += subPacket.size;
        subPackets.push(subPacket);
        if (DEBUG) console.log(`subPacket=${JSON.stringify(subPacket)} totalSize=${pos-startPos}`);
      }
      if (DEBUG) console.log('/recurse');
      return { version, type, subPackets, size: pos };
    }
  }
}

function versionSum(packet) {
  let total = packet.version;
  for (let subPacket of (packet.subPackets || [])) {
    total += versionSum(subPacket);
  }
  return total;
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n');

  for (let line of input) {
    console.log(line);
    console.log(JSON.stringify(parse(bits(line))));
    console.log(versionSum(parse(bits(line))));
  }
}

main();
