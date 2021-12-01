
def main():
  with open("input", "r") as f:
    data = [[int(part) for part in line.split()] for line in f.readlines()]

  diffs = [(max(numbers) - min(numbers)) for numbers in data]
  print sum(diffs)

if __name__ == '__main__':
  main()

