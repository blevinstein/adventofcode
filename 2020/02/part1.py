
import re

INPUT = re.compile(r'(\d+)-(\d+) (\w): (\w+)')

def is_valid(line):
  result = INPUT.fullmatch(line.strip())
  if not result:
    raise 'Input parsing failed: ' + line
  min, max, char, password = result.groups()
  min = int(min)
  max = int(max)
  count = password.count(char)
  return min <= count and count <= max

def main():
  with open('input.txt', 'r') as f:
    result = sum(1 for line in f.readlines() if is_valid(line))
  print(result)

if __name__ == '__main__':
  main()
