input = 277678

NEIGHBORS = [
    (1, 1),
    (1, 0),
    (1, -1),
    (0, 1),
    (0, -1),
    (-1, 1),
    (-1, 0),
    (-1, -1)
]

def sum_neighbors(grid, position):
  sum = 0
  for offset in NEIGHBORS:
    sum += grid.get(add(position, offset), 0)
  return sum

def main():
  grid = {(0, 0): 1}
  number = 2
  while True:
    position = get_spiral_position(number)
    value = sum_neighbors(grid, position)
    grid[position] = value
    number += 1
    if value > input:
      print value
      return

def get_spiral_position(n):
  directions = [(1, 0), (0, 1), (-1, 0), (0, -1)]
  current_index = 0
  direction_index = 0
  current_pos = (0, 0)
  side_length = 1
  while current_index < n - 1:
    spiral_distance = min(side_length, n - 1 - current_index)
    current_pos = add(current_pos, mul(directions[direction_index], spiral_distance))
    current_index += spiral_distance
    if direction_index % 2 == 1:
      side_length += 1
    direction_index = (direction_index + 1) % len(directions)
  return current_pos

def add(a, b):
  return (a[0] + b[0], a[1] + b[1])

def mul(point, scalar):
  return (point[0] * scalar, point[1] * scalar)

if __name__ == '__main__':
  main()

