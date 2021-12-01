
import re

REQUIRED_KEYS = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid']

def parse_passport(passport):
  entries = passport.split()
  map = {}
  for entry in entries:
    key, value = entry.split(':')
    map[key] = value
  return map

def is_valid(map):
  return all(key in map for key in REQUIRED_KEYS)

def main():
  with open('input.txt', 'r') as f:
    passports = map(parse_passport, f.read().strip().split('\n\n'))
  print(sum(1 for passport in passports if is_valid(passport)))

if __name__ == '__main__':
  main()
