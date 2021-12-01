import sys

DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]

PASSABLE = set(['-', '|'])

def main():
  with open('input', 'r') as f:
    map = f.readlines()
  print get_letters_and_steps(map)

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

def mul(vector, scalar):
  return (vector[0] * scalar, vector[1] * scalar)

def map_get(map, pos):
  if 0 <= pos[1] < len(map) and 0 <= pos[0] < len(map[pos[1]]):
    return map[pos[1]][pos[0]]
  return '*'

def get_letters_and_steps(map):
  letters = []
  # find starting position
  current_position = (map[0].index('|'), 0)
  current_direction = (0, 1)
  steps = 1
  # follow path
  while True:
    current_position = add(current_position, current_direction)
    steps += 1
    #print_neighborhood(map, current_position)
    terrain = map_get(map, current_position)
    if terrain == ' ':
      print 'We have lost the path at (%d, %d)' % current_position
      break
    elif terrain == '+':
      possible_directions = [dir for dir in DIRS if dir != mul(current_direction, -1)]
      possible_terrain = {}
      for dir in possible_directions:
        dir_terrain = map_get(map, add(current_position, dir))
        if dir_terrain in PASSABLE:
          possible_terrain[dir] = dir_terrain
      if len(possible_terrain) == 1:
        current_direction = possible_terrain.keys()[0]
      elif len(possible_terrain) == 0:
        break
      else:
        raise Exception('Multiple possible paths')
    elif terrain in PASSABLE:
      pass
    elif terrain.isalpha():
      letters.append(terrain)
    else:
      raise Exception('Unknown terrain')
  return (''.join(letters), steps - 1)

def print_neighborhood(map, pos, radius = 3):
  print '*' * (2 * radius + 1)
  for row in xrange(-radius, radius + 1):
    for col in xrange(-radius, radius + 1):
      if row == 0 and col == 0:
        sys.stdout.write('O')
      else:
        sys.stdout.write(map_get(map, add(pos, (col, row))))
    print
  print '*' * (2 * radius + 1)


if __name__=='__main__':
  main()

