
import re

HEADER = re.compile(r"Tile (\d+):")

# Treat each edge as a bitstring. Returns a list of 4 bitstrings:
#  - From (0, 0) to (w, 0), LSB = (0, 0)
#  - From (w, 0) to (w, h), LSB = (w, 0)
#  - From (w, h) to (0, h), LSB = (w, h)
#  - From (0, h) to (0, 0), LSB = (0, h)
# Fingerprint values are preserved (but rotated) when the tile is rotated.
# Fingerprint values are bit-flipped and re-ordered when tile is inverted.
def fingerprint(grid):
  h = len(grid)
  w = len(grid[0])
  return [
      sum(1 << (w-i-1) for i in range(w) if grid[0][i] == '#'),
      sum(1 << (h-i-1) for i in range(h) if grid[i][-1] == '#'),
      sum(1 << (w-i-1) for i in range(w) if grid[-1][-i-1] == '#'),
      sum(1 << (h-i-1) for i in range(h) if grid[-i-1][0] == '#')
  ]

def invert_fingerprint(fingerprint, length):
  inverted_values = [invert_bitstring(value, length) for value in fingerprint]
  return [
      inverted_values[0],
      inverted_values[3],
      inverted_values[2],
      inverted_values[1]
  ]

def invert_bitstring(value, length):
  return sum(1 << (length-i-1) for i in range(length) if value & (1 << i) > 0)

def parse_tile(tile_str):
  lines = tile_str.split('\n')
  id = int(HEADER.match(lines[0]).group(1))
  grid = lines[1:]
  f = fingerprint(grid)
  return (id, f, invert_fingerprint(f, len(grid)))

def main():
  with open('input.txt') as f:
  #with open('test.txt') as f:
    tiles = [parse_tile(str) for str in f.read().strip().split('\n\n')]
  print(tiles)

  # Count edge occurrences, and try to deduce which tiles are corners/edges
  edge_count = {}
  for tile in tiles:
    for edge in tile[1] + tile[2]:
      edge_count[edge] = edge_count.get(edge, 0) + 1
  for edge in edge_count.keys():
    if edge_count[edge] > 2:
      raise Exception('Hard mode!')

  answer = 1
  for tile in tiles:
    # count how many blanks are adjacent to this tile
    blank_count = 0
    for edge in tile[1]:
      if edge_count[edge] < 2:
        blank_count += 1
    if blank_count > 2:
      raise Exception('Tile does not fit')
    elif blank_count == 2:
      print('Tile %d is a corner' % tile[0])
      answer *= tile[0]
  print('Answer: %d' % answer)

if __name__ == '__main__':
  main()

