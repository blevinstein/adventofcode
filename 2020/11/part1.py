
UNITS = [
    (0, 1),
    (1, 1),
    (1, 0),
    (1, -1),
    (0, -1),
    (-1, -1),
    (-1, 0),
    (-1, 1),
]

def count(grid, x, y):
  result = 0
  h = len(grid)
  w = len(grid[0])
  for unit in UNITS:
    dx = x + unit[0]
    dy = y + unit[1]
    if dy >= 0 and dy < h and dx >= 0 and dx < w and grid[dy][dx] == '#':
      result += 1
  return result

def new_value(value, count):
  if value == 'L':
    return '#' if count == 0 else 'L'
  elif value == '#':
    return 'L' if count >= 4 else '#'
  elif value == '.':
    return '.'
  else:
    raise Exception('Unexpected value: "%s"' % value)

# returns a new grid
def evolve(grid):
  h = len(grid)
  w = len(grid[0])
  new_grid = []
  for y in range(h):
    new_grid.append('')
    for x in range(w):
      new_grid[-1] += new_value(grid[y][x], count(grid, x, y))
  if len(new_grid) != h or not all(len(new_grid[i]) == w for i in range(h)):
    raise 'Evolution produced wrong size!'
  return new_grid

def main():
  with open('input.txt', 'r') as f:
    grid = [line.strip() for line in f.readlines()]
  height = len(grid)
  width = len(grid[0])

  while True:
    new_grid = evolve(grid)
    if new_grid == grid:
      break
    else:
      grid = new_grid

  print(grid)
  print(sum(sum(1 for c in row if c == '#') for row in grid))

if __name__ == '__main__':
  main()
