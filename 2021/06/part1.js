
const fs = require('fs');

function afterSteps(times, n) {
  if (n == 0) return times;

  const nextTimes = [
    times[1],
    times[2],
    times[3],
    times[4],
    times[5],
    times[6],
    times[7] + times[0],
    times[8],
    times[0]
  ];
  return afterSteps(nextTimes, n-1);
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();
  const input = rawInput.trim().split(',').map(s => parseInt(s));

  const timeCount =
      Array.from(function*() { for (let i = 0; i < 9; ++i) yield i }())
          .map(i => input.filter(j => i == j).length);

  const totalFishAfter = (n) => afterSteps(timeCount, n).reduce((a, b) => a+b);

  console.log(`totalFishAfter(18) = ${totalFishAfter(18)}`);
  console.log(`totalFishAfter(80) = ${totalFishAfter(80)}`);
  console.log(`totalFishAfter(256) = ${totalFishAfter(256)}`);
}

main();
