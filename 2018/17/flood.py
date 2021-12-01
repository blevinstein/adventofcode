import re
import operator

VEIN = re.compile('([xy])=(\\d+), ([xy])=(\\d+)..(\\d+)')

SPRING = (500, 0)

UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  clay = reduce(operator.or_, map(parse_vein, lines))
  #check(clay)
  #water, visited = set([]), set([])
  water, visited = fill(clay)
  show(clay, water, visited)
  # Part 1
  print len(water | visited)
  # Part 2
  print len(water)

def check(clay):
  # assumption: there are no vertical gaps of size one
  # result: correct, the only vertical gaps of size one in the input are enclosed (unreachable)
  for c in clay:
    if add(c, DOWN) not in clay and reduce(add, [c, DOWN, DOWN]) in clay:
      print 'WARNING: vertical gap of size one at position (%d, %d)' % c

def fill(clay):
  visited = set([])
  water = set([])

  min_y = min(c[1] for c in clay)
  max_y = max(c[1] for c in clay)

  drop(clay, water, visited, max_y, SPRING)

  if any(w[1] < min_y or w[1] > max_y for w in water):
    print 'WARNING:water out of bounds: (%d, %d)' % w

  # filter visited to relevant range
  visited = set(filter(lambda v: v[1] >= min_y and v[1] <= max_y, visited))

  return water, visited


# returns the number of water particles settled
def drop(clay, water, visited, max_y, start_pos):
  def blocked(pos):
    return pos in clay or pos in water
  droplets = [start_pos]
  while droplets:
    # move straight down until blocked
    pos = droplets.pop()
    visited.add(pos)
    while not blocked(add(pos, DOWN)) and pos[1] <= max_y:
      pos = add(pos, DOWN)
      visited.add(pos)
    if pos[1] > max_y:
      continue
    # then move sideways
    left_pos = pos
    while not blocked(add(left_pos, LEFT)) and blocked(add(left_pos, DOWN)):
      left_pos = add(left_pos, LEFT)
      visited.add(left_pos)
    left_closed = blocked(add(left_pos, DOWN))
    right_pos = pos
    while not blocked(add(right_pos, RIGHT)) and blocked(add(right_pos, DOWN)):
      right_pos = add(right_pos, RIGHT)
      visited.add(right_pos)
    right_closed = blocked(add(right_pos, DOWN))
    # depending on the open/closed situation
    if right_closed and left_closed:
      floor = set((x, pos[1]) for x in xrange(left_pos[0], right_pos[0]+1))
      water |= floor
      # add a new droplet above where we just landed
      if start_pos[1] < pos[1]:
        droplets.append(add(pos, UP))
    elif right_closed:
      droplets.append(left_pos)
    elif left_closed:
      droplets.append(right_pos)
    else:
      droplets += [left_pos, right_pos]
  return water, visited

#def blocked(pos, clay, water):
#  return pos in clay or pos in water

def show(clay, water, visited):
  min_x = min(c[0] for c in clay)
  max_x = max(c[0] for c in clay)
  min_y = min(c[1] for c in clay)
  max_y = max(c[1] for c in clay)
  for y in xrange(min_y, max_y+1):
    print '%5d ' % y,
    for x in xrange(min_x, max_x+1):
      if (x, y) == (500, 0):
        print '+',
      elif (x, y) in clay:
        print '#',
      elif (x, y) in water:
        print '~',
      elif (x, y) in visited:
        print '|',
      else:
        print '.',
    print

# return set of (x, y) locations
def parse_vein(raw):
  match = VEIN.match(raw)
  if not match:
    raise Exception('bad vein: %s' % raw)
  if match.group(1) == match.group(3):
    raise Exception('Expected %s != %s' % (match.group(1), match.group(3)))
  if match.group(1) == 'x':
    return set([(int(match.group(2)), y)
      for y in xrange(int(match.group(4)), int(match.group(5))+1)])
  else:
    return set([(x, int(match.group(2)))
      for x in xrange(int(match.group(4)), int(match.group(5))+1)])

if __name__ == '__main__':
  main()
