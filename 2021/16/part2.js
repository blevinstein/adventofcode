
const fs = require('fs');

const DEBUG = false;

function bits(hex) {
  return Array.from(hex)
      .map(c => parseInt(c, 16))
      .flatMap(v => [(v & 1<<3)>>3, (v & 1<<2)>>2, (v & 1<<1)>>1, v & 1]);
}

function valueOf(bits) {
  const result = bits.reduce((a, b) => a*2 + b, 0);
  return result;
}

function parse(bits) {
  const version = valueOf(bits.slice(0, 3));
  const type = valueOf(bits.slice(3, 6));
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
    return { version, type, value: valueOf(valueBits), size: pos };
  } else {
    const lengthType = bits[pos++];
    let subPackets;
    if (lengthType == 1) {
      const numSubPackets = valueOf(bits.slice(pos, pos + 11));
      pos += 11;
      subPackets = [];
      for (let i = 0; i < numSubPackets; ++i) {
        const subPacket = parse(bits.slice(pos));
        pos += subPacket.size;
        subPackets.push(subPacket);
      }
    } else {
      const lengthSubPackets = valueOf(bits.slice(pos, pos + 15));
      pos += 15;
      const startPos = pos;
      subPackets = [];
      while (pos - startPos < lengthSubPackets) {
        const subPacket = parse(bits.slice(pos));
        pos += subPacket.size;
        subPackets.push(subPacket);
      }
    }

    const inputs = subPackets.map(subPacket => subPacket.value);
    let value;
    switch (type) {
      case 0:
        value = inputs.reduce((a, b) => a + b);
        break;
      case 1:
        value = inputs.reduce((a, b) => a * b);
        break;
      case 2:
        value = Math.min(...inputs);
        break;
      case 3:
        value = Math.max(...inputs);
        break;
      case 5:
        value = inputs[0] > inputs[1] ? 1  : 0;
        break;
      case 6:
        value = inputs[0] < inputs[1] ? 1 : 0;
        break;
      case 7:
        value = inputs[0] == inputs[1] ? 1 : 0;
        break;
    }

    return { version, type, subPackets, value, size: pos };
  }
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n');

  for (let line of input) {
    console.log(line);
    console.log(parse(bits(line)).value);
  }
}

main();
