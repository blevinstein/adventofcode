
const fs = require('fs');

function wins(board, numbers) {
  console.log(`check numbers ${Array.from(numbers)}`);
  for (let i = 0; i < 5; ++i) {
    let rowWin = true;
    let colWin = true;
    for (let j = 0; j < 5; ++j) {
      if (!numbers.has(board[i][j])) {
        rowWin = false;
      }
      if (!numbers.has(board[j][i])) {
        colWin = false;
      }
    }
    if (rowWin) return true;
    if (colWin) return true;
  }
  return false;
}

async function main() {
  const rawInput = fs.readFileSync(process.argv[2]).toString();

  let [numbers, ...boards] = rawInput.trim().split('\n\n');

  boards = boards.map(board => board.split('\n')
      .map(row => row.trim().split(/\s+/).map(s => parseInt(s))));
  numbers = numbers.split(',').map(s => parseInt(s));
  console.log(numbers);

  let numberCount = 5;
  const winCheck = board => wins(board, new Set(numbers.slice(0, numberCount)));
  while (boards.filter(b => !winCheck(b)).length > 1) {
    numberCount++;
  }
  const lastBoard = boards.find(b => !winCheck(b));
  while (!winCheck(lastBoard)) {
    numberCount++;
  }

  console.log(`win after ${numberCount}`);
  const numSet = new Set(numbers.slice(0, numberCount));
  const sumUnmarked = lastBoard.flat().filter(num => !numSet.has(num)).reduce((a, b) => a + b);
  console.log(`sumUnmarked=${sumUnmarked} lastNumber=${numbers[numberCount-1]} product=${sumUnmarked * numbers[numberCount-1]}`);
}

main();
