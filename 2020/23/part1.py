
def main():
  #cups = [int(c) for c in '389125467']
  cups = [int(c) for c in '974618352']

  min_cup = min(cups)
  max_cup = max(cups)

  print(cups)
  for move in range(100):
    removed_cups, cups = cups[1:4], [cups[0]] + cups[4:]
    target_cup = cups[0] - 1
    while target_cup not in cups:
      target_cup -= 1
      if target_cup < min_cup:
        target_cup = max_cup
    target_index = cups.index(target_cup)
    cups.insert(target_index + 1, removed_cups[0])
    cups.insert(target_index + 2, removed_cups[1])
    cups.insert(target_index + 3, removed_cups[2])
    # rotate cups so that new current cup is at index 0
    cups = cups[1:] + [cups[0]]
    print(cups)

  one_index = cups.index(1)
  cups = cups[one_index:] + cups[:one_index]
  print(''.join(str(c) for c in cups[1:]))

if __name__ == '__main__':
  main()
