
import re

def parse_seat(line):
  code = ''.join('1' if c in ['B', 'R'] else '0' for c in line)
  return int(code, 2)

def main():
  with open('input.txt', 'r') as f:
    seats = map(parse_seat, f.read().strip().split())
  print(max(seats))

if __name__ == '__main__':
  main()
