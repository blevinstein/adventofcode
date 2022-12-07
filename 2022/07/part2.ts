
import fs from 'fs';

function size(obj) {
  if (typeof obj == 'number') {
    return obj;
  } else {
    return Object.entries(obj)
        .map(([path, content]) => size(content))
        .reduce((a, b) => a + b);
  }
}

function allDirs(obj) {
  if (typeof obj == 'number') {
    return [];
  } else {
    return Object.entries(obj)
        .map(([path, content]) => allDirs(content))
        .reduce((a, b) => a.concat(b))
        .concat([obj]);
  }
}

async function main() {
  const rawInput: string = fs.readFileSync(process.argv[2]).toString().trim();
  const root = [];
  const stack = [];
  let current = root;
  for (let line of rawInput.split('\n')) {
    if (line.startsWith('$ cd ')) {
      const path = line.split(' ')[2];
      console.log(`cd ${path}`);
      if (path == '..') {
        current = stack.pop();
      } else {
        stack.push(current);
        const newDir = [];
        current[path] = newDir;
        current = newDir;
      }
    } else if (line == '$ ls') {
      // do nothing
    } else if (line.startsWith('dir ')) {
      const path = line.split(' ')[1];
      console.log(`found dir ${path}`);
      current[path] = [];
    } else {
      const [size, file] = line.split(' ');
      console.log(`found file ${file} size ${size}`);
      current[file] = Number(size);
    }
  }
  const totalSpace = 7e7;
  const usedSpace = size(root);
  const neededSpace = 3e7 - (totalSpace - usedSpace);
  console.log(`Need ${neededSpace}`);
  const bigSizes = allDirs(root).map(d => size(d)).filter(s => s > neededSpace);
  bigSizes.sort((a, b) => a - b);
  console.log(`Delete dir of size ${bigSizes[0]}`);
}

main()
  .then(() => console.log('Done'))
  .catch(e => console.error(e));
