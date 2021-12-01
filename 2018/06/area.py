import copy
import math

def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  coords = [tuple(map(int, line.split(', '))) for line in lines]
  # Part 1
  #print biggest_finite_voronoi_region(coords)
  # Part 2
  print size_of_central_region(coords, 10000)

def size_of_central_region(coords, max_dist):
  margin = int(math.ceil(max_dist * 1.0 / len(coords)))
  min_x = min(coord[0] for coord in coords) - margin
  max_x = max(coord[0] for coord in coords) + margin
  min_y = min(coord[1] for coord in coords) - margin
  max_y = max(coord[1] for coord in coords) + margin
  points = 0
  for x in xrange(min_x, max_x + 1):
    for y in xrange(min_y, max_y + 1):
      if total_dist(coords, (x, y)) < max_dist:
        points += 1
  return points

def total_dist(coords, pos):
  return sum(manhattan_dist(coord, pos) for coord in coords)

def biggest_finite_voronoi_region(coords):
  min_x = min(coord[0] for coord in coords)
  max_x = max(coord[0] for coord in coords)
  min_y = min(coord[1] for coord in coords)
  max_y = max(coord[1] for coord in coords)
  nearest = {}
  infinite = {}
  for coord in coords:
    nearest[coord] = 0
    infinite[coord] = False
  for x in xrange(min_x, max_x + 1):
    for y in xrange(min_y, max_y + 1):
      chosen = closest(coords, (x, y))
      if chosen is not None:
        nearest[chosen] += 1
        if x == min_x or x == max_x or y == min_y or y == max_y:
          infinite[chosen] = True
  for coord in coords:
    if infinite[coord]:
      nearest[coord] = 0
  return nearest[max(coords, key=lambda c: nearest[c])]

def closest(coords, pos):
  closest = copy.copy(coords)
  closest.sort(key = lambda c: manhattan_dist(c, pos))
  if manhattan_dist(closest[0], pos) == manhattan_dist(closest[1], pos):
    return None
  return closest[0]

def manhattan_dist(a, b):
  return abs(a[0] - b[0]) + abs(a[1] - b[1])

if __name__ == '__main__':
  main()
