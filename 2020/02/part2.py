
import re

INPUT = re.compile(r'(\d+)-(\d+) (\w): (\w+)')

def is_valid(line):
  result = INPUT.fullmatch(line.strip())
  if not result:
    raise 'Input parsing failed: ' + line
  a, b, char, password = result.groups()
  a = int(a)
  b = int(b)
  return (password[a-1] == char) != (password[b-1] == char)

def main():
  with open('input.txt', 'r') as f:
    result = sum(1 for line in f.readlines() if is_valid(line))
  print(result)

if __name__ == '__main__':
  main()
