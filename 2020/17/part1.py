
NEIGHBORS = [(x, y, z) for x in [-1, 0, 1] for y in [-1, 0, 1] for z in [-1, 0, 1]
              if (x, y, z) != (0, 0, 0)]

def add(a, b):
  return tuple(a[i] + b[i] for i in range(3))

def neighbors_of(position):
  return [add(position, neighbor) for neighbor in NEIGHBORS]

def bounding_box(active_set):
  first = list(active_set)[0]
  min_x = first[0]
  max_x = first[0]
  min_y = first[1]
  max_y = first[1]
  min_z = first[2]
  max_z = first[2]
  for x, y, z in active_set:
    min_x = min(x, min_x)
    min_y = min(y, min_y)
    min_z = min(z, min_z)
    max_x = max(x, max_x)
    max_y = max(y, max_y)
    max_z = max(z, max_z)
  return ((min_x, min_y, min_z), (max_x, max_y, max_z))

def count_active(active_set, position):
  result = 0
  for neighbor in neighbors_of(position):
    if neighbor in active_set:
      result += 1
  return result

def parse_grid(grid):
  active_set = set()
  for y, row in enumerate(grid):
    for x, cell in enumerate(row):
      if cell == '#':
        active_set.add((x, y, 0))
  return active_set

def print_set(active_set):
  min, max = bounding_box(active_set)
  print('bounds %s - %s' % (min, max))
  for z in range(min[2], max[2]+1):
    print('z=%d' % z)
    for y in range(min[1], max[1]+1):
      row = ''
      for x in range(min[0], max[0]+1):
        row += '#' if (x, y, z) in active_set else '.'
      print(row)
    print()

def simulate_step(active_set):
  # bounding box plus one square
  min, max = bounding_box(active_set)
  min = add(min, (-1, -1, -1))
  max = add(max, (1, 1, 1))
  # create a new active_set
  new_active_set = set()
  for x in range(min[0], max[0]+1):
    for y in range(min[1], max[1]+1):
      for z in range(min[2], max[2]+1):
        count = count_active(active_set, (x, y, z))
        if ((x, y, z) in active_set and count in [2, 3]) \
            or ((x, y, z) not in active_set and count == 3):
          new_active_set.add((x, y, z))
  return new_active_set

def main():
  with open('input.txt') as f:
    active_set = parse_grid(f.readlines())

  print_set(active_set)
  for i in range(6):
    active_set = simulate_step(active_set)
  print_set(active_set)
  print(len(active_set))

if __name__ == '__main__':
  main()
