
import re

REQUIRED_KEYS = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid']

HEIGHT = re.compile(r"(\d+)(cm|in)")
HAIR_COLOR = re.compile(r"#[0-9a-f]{6}")
PASSPORT_ID = re.compile(r"\d{9}")

EYE_COLORS = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth']

def parse_passport(passport):
  entries = passport.split()
  map = {}
  for entry in entries:
    key, value = entry.split(':')
    map[key] = value
  return map

def is_valid(map):
  if not all(key in map for key in REQUIRED_KEYS):
    return False
  if len(map['byr']) != 4 or map['byr'] < '1920' or map['byr'] > '2002':
    return False
  if len(map['iyr']) != 4 or map['iyr'] < '2010' or map['iyr'] > '2020':
    return False
  if len(map['eyr']) != 4 or map['eyr'] < '2020' or map['eyr'] > '2030':
    return False
  height_match = HEIGHT.fullmatch(map['hgt'])
  if not height_match:
    return False
  height_value = int(height_match.groups()[0])
  height_unit = height_match.groups()[1]
  if height_unit == 'cm' and (height_value < 150 or height_value > 193):
    return False
  if height_unit == 'in' and (height_value < 59 or height_value > 76):
    return False
  if not HAIR_COLOR.fullmatch(map['hcl']):
    return False
  if map['ecl'] not in EYE_COLORS:
    return False
  if not PASSPORT_ID.fullmatch(map['pid']):
    return False
  return True


def main():
  with open('input.txt', 'r') as f:
    passports = map(parse_passport, f.read().strip().split('\n\n'))
  print(sum(1 for passport in passports if is_valid(passport)))

if __name__ == '__main__':
  main()
