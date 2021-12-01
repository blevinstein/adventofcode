
import re

LINE = re.compile(r"((?:\w+ )+)\(contains((?: \w+,?)+)\)")

def parse_item(line):
  match = LINE.match(line.strip())
  if not match:
    raise Exception('Line did not parse: %s' % line)
  ingredients = match.group(1).strip().split()
  allergens = match.group(2).strip().split(', ')
  return (ingredients, allergens)


def main():
  with open('input.txt') as f:
  #with open('test.txt') as f:
    items = [parse_item(line) for line in f.readlines()]

  all_ingredients = set()
  all_allergens = set()
  for ingredients, allergens in items:
    for ingredient in ingredients:
      all_ingredients.add(ingredient)
    for allergen in allergens:
      all_allergens.add(allergen)

  # determine possible ingredients for each allergen
  possible_ingredients = {}
  for allergen in all_allergens:
    possible_ingredients[allergen] = all_ingredients
  print(possible_ingredients)
  for ingredients, allergens in items:
    for allergen in allergens:
      possible_ingredients[allergen] = possible_ingredients[allergen] & set(ingredients)
  print(possible_ingredients)

  # determine safe ingredients
  safe_ingredients = []
  for ingredient in all_ingredients:
    if all(ingredient not in possible_ingredients[allergen] for allergen in all_allergens):
      safe_ingredients.append(ingredient)

  print(safe_ingredients)
  safe_count = 0
  for ingredients, allergens in items:
    for ingredient in ingredients:
      if ingredient in safe_ingredients:
        safe_count += 1
  print(safe_count)

if __name__ == '__main__':
  main()

