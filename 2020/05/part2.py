
import re

def parse_seat(line):
  code = ''.join('1' if c in ['B', 'R'] else '0' for c in line)
  return int(code, 2)

def main():
  with open('input.txt', 'r') as f:
    seats = [parse_seat(line.strip()) for line in f.readlines()]
  available_seats = list(set(range(0, 127 * 8 + 7)) - set(seats))
  for candidate in available_seats:
    if (candidate + 8) in seats and (candidate - 8) in seats:
      print(candidate)

if __name__ == '__main__':
  main()
