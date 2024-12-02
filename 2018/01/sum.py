
def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()

  changes = [int(line) for line in lines]
  print sum(changes)
  print first_repeat(changes)


def first_repeat(changes):
  freq = 0
  visited = set([0])
  while True:
    for change in changes:
      freq += change
      if freq in visited:
        return freq
      visited.add(freq)

if __name__ == '__main__':
  main()
