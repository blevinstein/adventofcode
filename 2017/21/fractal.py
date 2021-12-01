

def parse(pattern):
  grid = pattern.split('/')
  return [[{'.': False, '#': True}[cell] for cell in row] for row in grid]

def rotate(grid):
  size = len(grid)
  new_grid = []
  for r in xrange(len(grid)):
    new_row = []
    for c in xrange(len(grid)):
      new_row.append(grid[c][size-1-r])
    new_grid.append(new_row)
  return new_grid

def pretty(grid):
  return '\n'.join(''.join({False: '.', True: '#'}[cell] for cell in line) for line in grid)

XFMS = [
    lambda grid: grid, # identity
    lambda grid: rotate(grid),
    lambda grid: rotate(rotate(grid)),
    lambda grid: rotate(rotate(rotate(grid))),
    lambda grid: list(reversed(grid)), # vertical flip
    lambda grid: rotate(list(reversed(grid))),
    lambda grid: rotate(rotate(list(reversed(grid)))),
    lambda grid: rotate(rotate(rotate(list(reversed(grid)))))
]

# returns a subgrid of specified size, with subgrid coordinate (row, col)
def make_subgrid(grid, size, row, col):
  new_grid = []
  for r in xrange(size):
    new_row = []
    for c in xrange(size):
      new_row.append(grid[row * size + r][col * size + c])
    new_grid.append(new_row)
  return new_grid

def make_subgrids(grid, size):
  assert len(grid) % size == 0, 'grid %d subgrid %d' % (len(grid), size)
  divs = len(grid) / size
  return [[make_subgrid(grid, size, r, c) for c in xrange(divs)] for r in xrange(divs)]

def map_grid(f, grid):
  return [map(f, row) for row in grid]

def matches(a, b):
  for xfm in XFMS:
    if xfm(a) == b:
      return True

def merge(subgrids):
  subgrid_size = len(subgrids[0][0])
  new_size = len(subgrids) * subgrid_size
  new_grid = []
  for row in xrange(new_size):
    new_row = []
    grid_row = row / subgrid_size
    subgrid_row = row % subgrid_size
    for col in xrange(new_size):
      grid_col = col / subgrid_size
      subgrid_col = col % subgrid_size
      new_row.append(subgrids[grid_row][grid_col][subgrid_row][subgrid_col])
    new_grid.append(new_row)
  return new_grid

INITIAL = parse('.#./..#/###')

def transform(patch, rules):
  for rule in rules:
    if matches(rule[0], patch):
      return rule[1]

def main():
  with open('input', 'r') as f:
    rules = []
    for line in f.readlines():
      input, output = line.strip().split(' => ')
      rules.append((parse(input), parse(output)))
  state = INITIAL
  for iteration in xrange(18):
    print 'iteration %d...' % iteration
    size = 2 if len(state) % 2 == 0 else 3
    subgrids = make_subgrids(state, size)
    subgrids = map_grid(lambda g: transform(g, rules), subgrids)
    state = merge(subgrids)
    #print pretty(state)
    #print
  light_count = 0
  for row in state:
    for col in row:
      if col:
        light_count += 1
  print light_count

if __name__=='__main__':
  main()
