
CLEAR = 0
LUMBERYARD = 1
TREES = 2

def main():
  with open('input.txt', 'r') as f:
    lines = [line.strip() for line in f.readlines()]
  map = {}
  for y, line in enumerate(lines):
    for x, state in enumerate(line):
      if state == '#':
        map[(x, y)] = LUMBERYARD
      elif state == '|':
        map[(x, y)] = TREES
      elif state == '.':
        map[(x, y)] = CLEAR
      else:
        raise Exception('bad state: %s' % state)
  # Part 1
  final_map = evolve(map, 1000000000)
  print show(final_map)
  print len([m for m in final_map if final_map[m] == LUMBERYARD]) * len([m for m in final_map if
    final_map[m] == TREES])

def evolve(map, steps):
  seen = {}
  s = 0
  while s < steps:
    new_map = {}
    for m in map:
      if map[m] == CLEAR:
        new_map[m] = [CLEAR, TREES][neighbor_count(map, m, TREES) >= 3]
      elif map[m] == TREES:
        new_map[m] = [TREES, LUMBERYARD][neighbor_count(map, m, LUMBERYARD) >= 3]
      elif map[m] == LUMBERYARD:
        new_map[m] = [CLEAR, LUMBERYARD][neighbor_count(map, m, LUMBERYARD) >= 1 and
            neighbor_count(map, m, TREES) >= 1]
      else:
        raise 'bad map state: %d' % map[m]
    map = new_map
    string = show(map)
    if string in seen:
      cycle_length = s - seen[string]
      print 'cycle length %d' % cycle_length
      skip_cycles = (steps - s) / cycle_length
      s += skip_cycles * cycle_length
    else:
      seen[string] = s
    s += 1
  return map

def neighbor_count(map, coord, value):
  return sum(1 for n in neighbors(coord) if map.get(n, None) == value)

def neighbors(coord):
  return [(coord[0], coord[1] + 1),
          (coord[0], coord[1] - 1),
          (coord[0] + 1, coord[1]),
          (coord[0] - 1, coord[1]),
          (coord[0] - 1, coord[1] - 1),
          (coord[0] - 1, coord[1] + 1),
          (coord[0] + 1, coord[1] - 1),
          (coord[0] + 1, coord[1] + 1)]

def show(map):
  result = ''
  max_x = max(m[0] for m in map)
  max_y = max(m[1] for m in map)
  for y in xrange(max_y+1):
    for x in xrange(max_x+1):
      if map[(x, y)] == LUMBERYARD:
        result += '#'
      elif map[(x, y)] == TREES:
        result += '|'
      elif map[(x, y)] == CLEAR:
        result += '.'
      else:
        raise Exception('bad state: %d' % map[(x, y)])
    result += '\n'
  return result

if __name__ == '__main__':
  main()
