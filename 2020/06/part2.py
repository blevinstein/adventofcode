
import re

def count_letters(group):
  persons = [set(g) for g in group.split()]
  all_letters = persons[0]
  for person in persons:
    all_letters = all_letters & person
  return len(all_letters)

def main():
  with open('input.txt', 'r') as f:
    groups = f.read().strip().split('\n\n')
  print(sum(map(count_letters, groups)))

if __name__ == '__main__':
  main()
