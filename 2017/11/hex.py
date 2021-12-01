DIRS = {
    'nw': (-1, 0.5),
    'ne': (1, 0.5),
    'sw': (-1, -0.5),
    'se': (1, -0.5),
    'n': (0, 1),
    's': (0, -1)
}

def add(x, y):
  return (x[0] + y[0], x[1] + y[1])

def hex_dist(offset):
  x = abs(offset[0])
  y = abs(offset[1])
  if 2 * y > x:
    return x + int(y - x/2.0)
  else:
    return x

def sum_dist(dirs):
  offset = (0, 0)
  for dir in dirs:
    offset = add(offset, DIRS[dir])
  return offset

def main():
  with open('input', 'r') as f:
    dirs = [part for part in f.read().strip().split(',')]
  max_dist = 0
  position = (0, 0)
  for dir in dirs:
    position = add(position, DIRS[dir])
    if hex_dist(position) > max_dist:
      max_dist = hex_dist(position)
  print max_dist
  print hex_dist(sum_dist(dirs))

if __name__=='__main__':
  main()
