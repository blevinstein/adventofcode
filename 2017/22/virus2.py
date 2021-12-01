import sys

from enum import Enum

class State(Enum):
  CLEAN = 0
  WEAKENED = 1
  FLAGGED = 2
  INFECTED = 3

DIRS = [(0, -1), (1, 0), (0, 1), (-1, 0)]
DIR_NAMES = ['up', 'right', 'down', 'left']

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

# direction should be represented as a number 0-3
def step(infected, position, direction):
  return (position, direction)

def show(map, position):
  xs = map(lambda p: p[0], infections)
  ys = map(lambda p: p[1], infections)
  min_x = min(xs)
  max_x = max(xs)
  min_y = min(ys)
  max_y = max(ys)
  print '(%d, %d) to (%d, %d)' % (min_x, min_y, max_x, max_y)
  for y in xrange(min_y, max_y+1):
    for x in xrange(min_x, max_x+1):
      sys.stdout.write('[' if (x, y) == position else ' ')
      sys.stdout.write({
              State.CLEAN: '.',
              State.INFECTED: '#',
              State.FLAGGED: 'F',
              State.WEAKENED: 'W'
          }[map.get((x, y), State.CLEAN)])
      sys.stdout.write(']' if (x, y) == position else ' ')
    print

def main():
  with open('input', 'r') as f:
    infected_grid = [[{
            '.': State.CLEAN,
            '#': State.INFECTED
        }[char] for char in line.strip()]
        for line in f.readlines()]
  map = {
      (x, y): infected_grid[y][x]
          for y in xrange(len(infected_grid))
          for x in xrange(len(infected_grid[0]))
          if infected_grid[y][x]
      }
  position = (len(infected_grid[0]) / 2, len(infected_grid) / 2)
  direction = 0
  infections = 0
  for iteration in xrange(10000000):
    #print position
    #print DIR_NAMES[direction]
    direction = (direction + {
            State.CLEAN: -1,
            State.WEAKENED: 0,
            State.INFECTED: 1,
            State.FLAGGED: 2
        }[map.get(position, State.CLEAN)]) % 4
    if map.get(position, State.CLEAN) == State.WEAKENED:
      infections += 1
    map[position] = {
            State.CLEAN: State.WEAKENED,
            State.WEAKENED: State.INFECTED,
            State.INFECTED: State.FLAGGED,
            State.FLAGGED: State.CLEAN
        }[map.get(position, State.CLEAN)]
    position = add(position, DIRS[direction])
  #show(map, position)
  print infections

if __name__=='__main__':
  main()
