
import fs from 'fs';

const scoreCache = {};

const value = {
  'T': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

function getValue(card) {
  if (card in value) {
    return value[card];
  } else {
    return Number(card);
  }
}

function getScore(hand) {
  if (!(hand in scoreCache)) {
    scoreCache[hand] = score(hand);
  }
  return scoreCache[hand];
}

function score(hand) {
  const counts = {};
  for (let card of hand) {
    counts[card] = (counts[card] || 0) + 1;
  }
  const sets = Object.values(counts).sort((a, b) => b - a);

  if (sets[0] === 5) {
    return 7;
  } else if (sets[0] === 4) {
    return 6;
  } else if (sets[0] === 3 && sets[1] === 2) {
    return 5;
  } else if (sets[0] === 3) {
    return 4;
  } else if (sets[0] === 2 && sets[1] === 2) {
    return 3;
  } else if (sets[0] === 2) {
    return 2;
  } else {
    return 1;
  }
}

async function main() {
  const hands = fs.readFileSync(process.argv[2]).toString().trim().split('\n').map(line => {
    const parts = line.split(' ');
    return {
      hand: parts[0],
      bid: Number(parts[1]),
    };
  });
  hands.sort((a, b) => {
    const aScore = getScore(a.hand);
    const bScore = getScore(b.hand);
    if (aScore !== bScore) return aScore - bScore;
    for (let i = 0; i < a.hand.length; ++i) {
      if (a.hand[i] !== b.hand[i]) {
        return getValue(a.hand[i]) - getValue(b.hand[i]);
      }
    }
    throw new Error(`Identical hands! ${a.hand} ${b.hand}`);
  });
  console.log(hands);
  console.log(hands.map((hand, i) => hand.bid * (i + 1)).reduce((a, b) => a + b));
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
