
import math
import re

HEADER = re.compile(r"Tile (\d+):")

SEA_MONSTER = [
  "                  # ",
  "#    ##    ##    ###",
  " #  #  #  #  #  #   ",
]

TOP = 0
RIGHT = 1
BOTTOM = 2
LEFT = 3

# Tiles are represented as a tuple of (id, fingerprint, grid).
# To calculate fingerprint, treat each edge as a bitstring. Returns a list of
# four bitstrings:
#  - From (0, 0) to (w, 0), MSB = (0, 0)
#  - From (w, 0) to (w, h), MSB = (w, 0)
#  - From (w, h) to (0, h), MSB = (w, h)
#  - From (0, h) to (0, 0), MSB = (0, h)
# Fingerprint values are preserved (but rotated) when the tile is rotated.
# Fingerprint values are bit-flipped and re-ordered when tile is flipped.
def fingerprint(grid):
  h = len(grid)
  w = len(grid[0])
  return [
      sum(1 << (w-i-1) for i in range(w) if grid[0][i] == '#'),
      sum(1 << (h-i-1) for i in range(h) if grid[i][-1] == '#'),
      sum(1 << (w-i-1) for i in range(w) if grid[-1][-i-1] == '#'),
      sum(1 << (h-i-1) for i in range(h) if grid[-i-1][0] == '#')
  ]

def rotate_tile(tile):
  return (tile[0], rotate_fingerprint(tile[1]), rotate_grid(tile[2]))

def mirror_tile(tile):
  return (tile[0], mirror_fingerprint(tile[1], len(tile[2])), mirror_grid(tile[2]))

def rotate_fingerprint(fingerprint, times = 1):
  result = fingerprint
  for i in range(times % 4):
    result = [result[i] for i in [RIGHT, BOTTOM, LEFT, TOP]]
  return result

def rotate_grid(grid, times = 1):
  size = len(grid)
  result_grid = grid
  for i in range(times % 4):
    new_grid = [[None for i in range(size)] for i in range(size)]
    for r in range(size):
      for c in range(size):
        new_grid[r][c] = result_grid[c][-r-1]
    result_grid = new_grid
  return result_grid

def mirror_grid(grid):
  size = len(grid)
  new_grid = [[None for i in range(size)] for i in range(size)]
  for r in range(size):
    for c in range(size):
      new_grid[r][c] = grid[-r-1][c]
  return new_grid

def mirror_fingerprint(fingerprint, length):
  flipped_values = [flip_bitstring(value, length) for value in fingerprint]
  return [
      flipped_values[BOTTOM],
      flipped_values[RIGHT],
      flipped_values[TOP],
      flipped_values[LEFT]
  ]

def flip_bitstring(value, length):
  return sum(1 << (length-i-1) for i in range(length) if value & (1 << i) > 0)

def parse_tile(tile_str):
  lines = tile_str.split('\n')
  id = int(HEADER.match(lines[0]).group(1))
  grid = lines[1:]
  return (id, fingerprint(grid), grid)

def print_tile(tile):
  print('Tile %d - fingerprint %s / %s' % (tile[0], tile[1], mirror_fingerprint(tile[1],
    len(tile[2]))))
  for row in tile[2]:
    for cell in row:
      print(cell, end='')
    print()
  print()

def find_sea_monsters(grid):
  locations = []
  print('Grid size %d x %d' % (len(grid), len(grid[0])))
  print('Monster size %d x %d' % (len(SEA_MONSTER), len(SEA_MONSTER[0])))
  print('Finding in search grid %d x %d' % (len(grid) - len(SEA_MONSTER), len(grid[0]) -
    len(SEA_MONSTER[0])))
  for offset_r in range(len(grid) - len(SEA_MONSTER)):
    for offset_c in range(len(grid[0]) - len(SEA_MONSTER[0])):
      found = True
      for local_r in range(len(SEA_MONSTER)):
        for local_c in range(len(SEA_MONSTER[0])):
          if SEA_MONSTER[local_r][local_c] == '#' and not grid[offset_r + local_r][offset_c +
              local_c] == '#':
            found = False
            break
        if not found:
          break
      if found:
        locations.append((offset_r, offset_c))
  return locations

def main():
  with open('input.txt') as f:
  #with open('test.txt') as f:
    tiles = [parse_tile(str) for str in f.read().strip().split('\n\n')]

  # Count edge occurrences, and try to deduce which tiles are corners/edges
  edge_count = {}
  for tile in tiles:
    for edge in tile[1] + mirror_fingerprint(tile[1], len(tile[2])):
      edge_count[edge] = edge_count.get(edge, 0) + 1
  for edge in edge_count.keys():
    if edge_count[edge] > 2:
      raise Exception('Hard mode!')

  def count_blanks(tile):
    blank_count = 0
    for edge in tile[1]:
      if edge_count[edge] < 2:
        blank_count += 1
    return blank_count

  def pop_tile_with_edge(search_tiles, edge_value):
    for i in range(len(search_tiles)):
      tile = search_tiles[i]
      if edge_value in tile[1]:
        return search_tiles.pop(i)
      if edge_value in mirror_fingerprint(tile[1], len(tile[2])):
        return mirror_tile(search_tiles.pop(i))
    raise Exception('No tile contains this edge')

  corner_tiles = []
  edge_tiles = []
  middle_tiles = []
  for tile in tiles:
    blank_count = count_blanks(tile)
    if blank_count > 2:
      raise Exception('Tile does not fit')
    elif blank_count == 2:
      corner_tiles.append(tile)
    elif blank_count == 1:
      edge_tiles.append(tile)
    else:
      middle_tiles.append(tile)

  origin_tile = corner_tiles.pop()
  if count_blanks(origin_tile) < 2:
    raise Exception('Did not pick a correct origin tile')
  # Rotate until oriented such that the first and last elements of fingerprint do not match any
  # other tile.
  while edge_count[origin_tile[1][TOP]] == 2 or edge_count[origin_tile[1][LEFT]] == 2:
    origin_tile = rotate_tile(origin_tile)

  BITS = len(origin_tile[2])
  tile_grid_size = int(math.sqrt(len(tiles)))
  tile_grid = []
  for tile_r in range(tile_grid_size):
    tile_grid.append([])
    for tile_c in range(tile_grid_size):
      if tile_r == 0 and tile_c == 0:
        tile_grid[-1].append(origin_tile)
      elif tile_r == 0:
        left_border = flip_bitstring(tile_grid[tile_r][tile_c - 1][1][RIGHT], BITS)
        # Find another tile with this edge value
        next_tile = pop_tile_with_edge(
            corner_tiles if tile_c == tile_grid_size - 1 else edge_tiles,
            left_border)
        # Rotate until it is aligned
        while next_tile[1][LEFT] != left_border:
          print('Rotate tile')
          next_tile = rotate_tile(next_tile)
        # Sanity check
        if edge_count[next_tile[1][TOP]] > 1:
          print('[%d, %d] %s' % (tile_r, tile_c, next_tile))
          raise Exception('Top edge is not aligned correctly!')
        tile_grid[-1].append(next_tile)
      elif tile_c == 0:
        top_border = flip_bitstring(tile_grid[tile_r - 1][tile_c][1][BOTTOM], BITS)
        # Find another tile with this edge value
        next_tile = pop_tile_with_edge(
            corner_tiles if tile_r == tile_grid_size - 1 else edge_tiles,
            top_border)
        # Rotate until it is aligned
        while next_tile[1][TOP] != top_border:
          print('Rotate tile')
          next_tile = rotate_tile(next_tile)
        # Sanity check
        if edge_count[next_tile[1][LEFT]] > 1:
          raise Exception('Left edge is not aligned correctly!')
        tile_grid[-1].append(next_tile)
      else:
        left_border = flip_bitstring(tile_grid[-1][-1][1][RIGHT], BITS)
        top_border = flip_bitstring(tile_grid[tile_r - 1][tile_c][1][BOTTOM], BITS)
        # Find another tile with these edge values
        next_tile = pop_tile_with_edge(
            corner_tiles if tile_r == tile_grid_size - 1 and tile_c == tile_grid_size - 1 else (
                edge_tiles if tile_c == tile_grid_size - 1 or tile_r == tile_grid_size - 1 else middle_tiles),
            left_border)
        if top_border not in next_tile[1]:
          raise Exception('Picked a bad tile!')
        # Rotate until it is aligned
        while next_tile[1][TOP] != top_border:
          print('Rotate tile')
          next_tile = rotate_tile(next_tile)
        if next_tile[1][LEFT] != left_border:
          raise Exception('Alignment failed!')
        tile_grid[-1].append(next_tile)
      print('Added tile %d at location [%d, %d], fingerprint %s / %s' % (tile_grid[tile_r][tile_c][0],
        tile_r, tile_c, tile_grid[tile_r][tile_c][1],
        mirror_fingerprint(tile_grid[tile_r][tile_c][1], BITS)))

  print()
  for r in range(tile_grid_size):
    for c in range(tile_grid_size):
      print('%10d' % tile_grid[r][c][0], end='')
    print()

  image = []
  for tile_r in range(tile_grid_size):
    #image.append('')
    for r in range(1, BITS-1):
      image.append('')
      for tile_c in range(tile_grid_size):
        #image[-1] += ' '
        for c in range(1, BITS-1):
          image[-1] += tile_grid[tile_r][tile_c][2][r][c]
  print(*image, sep = '\n')

  sea_monsters = find_sea_monsters(image)
  attempt = 1
  while not sea_monsters:
    print('Sea monsters not found, transforming and retrying...')
    if attempt == 4:
      image = mirror_grid(image)
    elif attempt > 8:
      raise Exception('No sea monsters found!')
    else:
      image = rotate_grid(image)
    attempt += 1
    sea_monsters = find_sea_monsters(image)
  print(sea_monsters)

  sea_monster_hashes = sum(sum(1 for cell in row if cell == '#') for row in SEA_MONSTER)
  all_hashes = sum(sum(1 for cell in row if cell == '#') for row in image)
  print(all_hashes - (sea_monster_hashes * len(sea_monsters)))

if __name__ == '__main__':
  main()

