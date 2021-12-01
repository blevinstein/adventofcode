import sys

DIRS = [(0, -1), (1, 0), (0, 1), (-1, 0)]
DIR_NAMES = ['up', 'right', 'down', 'left']

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

# direction should be represented as a number 0-3
def step(infected, position, direction):
  return (position, direction)

def show(infections, position):
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
      if (x, y) in infections:
        sys.stdout.write('#')
      else:
        sys.stdout.write('.')
      sys.stdout.write(']' if (x, y) == position else ' ')
    print

def main():
  with open('input', 'r') as f:
    infected_grid = [[{'.': False, '#': True}[char] for char in line.strip()] for line in f.readlines()]
  infected_set = set([
      (x, y)
          for y in xrange(len(infected_grid))
          for x in xrange(len(infected_grid[0]))
          if infected_grid[y][x]
      ])
  position = (len(infected_grid[0]) / 2, len(infected_grid) / 2)
  direction = 0
  infections = 0
  for iteration in xrange(10000):
    #print position
    #print DIR_NAMES[direction]
    direction = (direction + (1 if position in infected_set else -1)) % 4
    if position in infected_set:
      infected_set.remove(position)
    else:
      infections += 1
      infected_set.add(position)
    position = add(position, DIRS[direction])
  #show(infected_set, position)
  print infections

if __name__=='__main__':
  main()
