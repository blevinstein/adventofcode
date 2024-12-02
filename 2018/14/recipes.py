
def main():
  # Part 1
  print ''.join(map(str, get_recipes(939601, 10)))
  # Part 2
  print find_recipes([9,3,9,6,0,1])

def find_recipes(target):
  recipes = [3, 7]
  elves = [0, 1]
  while recipes[-len(target):] != target and recipes[-len(target)-1:-1] != target:
    recipes += split(recipes[elves[0]] + recipes[elves[1]])
    for i in xrange(2):
      elves[i] = (elves[i] + recipes[elves[i]] + 1) % len(recipes)
  if recipes[-len(target):] == target:
    return len(recipes) - len(target)
  elif recipes[-len(target)-1:-1] == target:
    return len(recipes) - len(target) - 1
  else:
    raise Exception('Unexpected')

def get_recipes(start, num):
  recipes = [3, 7]
  elves = [0, 1]
  while len(recipes) < start + num:
    recipes += split(recipes[elves[0]] + recipes[elves[1]])
    for i in xrange(2):
      elves[i] = (elves[i] + recipes[elves[i]] + 1) % len(recipes)
  return recipes[start:start+num]

def split(r):
  if r >= 10:
    return [r / 10, r % 10]
  else:
    return [r]

if __name__ == '__main__':
  main()
