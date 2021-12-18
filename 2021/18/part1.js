
const fs = require('fs');

const DEBUG = false;

class Node {
  constructor(_value, _parent = null) {
    if (_value === undefined) throw Error(`Invalid Node value: ${_value}`);

    this.parent = _parent;
    if (typeof _value == 'number') {
      this.isLeaf = true;
      this.numValue = _value;
    } else {
      this.isLeaf = false;
      this.left = new Node(_value[0], this);
      this.right = new Node(_value[1], this);
    }
  }

  value() {
    if (this.isLeaf) {
      return this.numValue;
    } else {
      return [this.left.value(), this.right.value()];
    }
  }

  copy() {
    return new Node(this.value(), this.parent);
  }

  // Return next node to the left
  searchLeft() {
    if (!this.parent) return;

    if (this.parent.right == this) {
      let node = this.parent.left;
      while (!node.isLeaf) node = node.right;
      return node;
    }

    if (this.parent.left == this) {
      return this.parent.searchLeft();
    }
  }

  // Return next node to the right
  searchRight() {
    if (!this.parent) return;

    if (this.parent.left == this) {
      let node = this.parent.right;
      while (!node.isLeaf) node = node.left;
      return node;
    }

    if (this.parent.right == this) {
      return this.parent.searchRight();
    }
  }

  add(other) {
    return new Node([this.value(), other.value()]);
  }

  reduce() {
    while (this.tryReduce()) {}
    return this;
  }

  tryReduce() {
    let stack = [[this, 0]];
    while (stack.length > 0) {
      const [node, level] = stack.pop();
      if (!node.isLeaf && node.left.isLeaf && node.right.isLeaf && level >= 4) {
        const nextLeft = node.searchLeft();
        const nextRight = node.searchRight();
        if (DEBUG) console.log(`explode ${node} => ${nextLeft} and ${nextRight}`);
        if (nextLeft) nextLeft.numValue += node.left.numValue;
        if (nextRight) nextRight.numValue += node.right.numValue;
        node.isLeaf = true;
        node.left = undefined;
        node.right = undefined;
        node.numValue = 0;
        return true;
      }
      if (!node.isLeaf) {
        stack.push([node.right, level+1]);
        stack.push([node.left, level+1]);
      }
    }
    stack = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.isLeaf && node.numValue >= 10) {
        if (DEBUG) console.log(`split ${node.numValue}`);
        node.isLeaf = false;
        node.left = new Node(Math.floor(node.numValue / 2), node);
        node.right = new Node(Math.ceil(node.numValue / 2), node);
        node.numValue = undefined;
        return true;
      }
      if (!node.isLeaf) {
        stack.push(node.right);
        stack.push(node.left);
      }
    }
  }

  magnitude() {
    if (this.isLeaf) {
      return this.numValue;
    } else {
      return 3 * this.left.magnitude() + 2 * this.right.magnitude();
    }
  }

  toString() {
    if (this.isLeaf) {
      return this.numValue.toString();
    } else {
      return `[${this.left.toString()},${this.right.toString()}]`;
    }
  }
}

async function main() {
  let input = fs.readFileSync(process.argv[2])
      .toString()
      .trim()
      .split('\n')
      .map(JSON.parse)
      .map(value => new Node(value));

  let result = input.reduce((a, b) => a.add(b).reduce());
  console.log(result.toString());
  console.log(result.magnitude());

  console.log('Done');
}

main();
