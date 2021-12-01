

def main():
  #with open('test.txt', 'r') as f:
  with open('input.txt', 'r') as f:
    map = [line.strip() for line in f.readlines()]
  height = len(map)
  width = len(map[0])

  def get_trees(run, drop):
    trees = 0
    for r in range(len(map)):
      if r % drop == 0 and map[r][(r * run // drop) % width] == '#':
        trees += 1
    return trees

  def print_grid(run, drop):
    trees = 0
    for r in range(len(map)):
      sled_x = (run * (r // drop)) % width if r % drop == 0 else None
      for c in range(max(len(map[0]), sled_x or 0)):
        if c == sled_x:
          if map[r][c % width] == '#':
            print('X', end='')
            trees += 1
          else:
            print('O', end='')
        else:
          print(map[r][c % width], end='')
      print()
    return trees

  #print(print_grid(1, 2))
  print([get_trees(1, 1), get_trees(3, 1), get_trees(5, 1), get_trees(7, 1), get_trees(1, 2)])
  print(get_trees(1, 1) * get_trees(3, 1) * get_trees(5, 1) * get_trees(7, 1) * get_trees(1, 2))

if __name__ == '__main__':
  main()
