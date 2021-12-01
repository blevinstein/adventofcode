

def main():
  with open('input.txt', 'r') as f:
    map = [line.strip() for line in f.readlines()]
  height = len(map)
  width = len(map[0])

  trees = 0
  for h in range(height):
    x = (3 * h) % width
    if map[h][x] == '#':
      trees += 1

  print(trees)

if __name__ == '__main__':
  main()
