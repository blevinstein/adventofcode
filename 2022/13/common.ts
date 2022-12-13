
export function lessThan(left, right) {
  if (typeof left == 'number' && typeof right == 'number') {
    return left < right;
  } else if (typeof left == 'object' && typeof right == 'object') {
    for (let i = 0; i < Math.min(left.length, right.length); ++i) {
      //console.log(`Recur ${JSON.stringify(left[i])} vs ${JSON.stringify(right[i])}`);
      if (lessThan(left[i], right[i])) {
        return true;
      } else if (lessThan(right[i], left[i])) {
        return false;
      }
    }
    if (right.length <= left.length) {
      //console.log('Right ran out of items');
      return false;
    }
    //console.log('Default true');
    return true;
  } else if (typeof left == 'number') {
    //console.log('Wrap left');
    return lessThan([left], right);
  } else {
    //console.log('Wrap right');
    return lessThan(left, [right]);
  }
}

