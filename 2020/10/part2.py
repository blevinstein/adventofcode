
def main():
  with open('input.txt', 'r') as f:
    input = [int(line.strip()) for line in f.readlines()]
  # sort by joltage
  input.sort()
  # append built-in adapter
  input.append(input[-1] + 3)

  # split list into consecutive sublists
  sublists = []
  next_sublist = [0]
  last_joltage = 0
  for adapter in input:
    if adapter == last_joltage + 1:
      next_sublist.append(adapter)
    elif next_sublist:
      sublists.append(next_sublist)
      next_sublist = [adapter]
    last_joltage = adapter
  if next_sublist:
    sublists.append(next_sublist)

  total = 1
  for sublist in sublists:
    if len(sublist) > 5:
      raise Exception('Not implemented')
    total *= {1: 1, 2: 1, 3: 2, 4: 4, 5: 7}[len(sublist)]

  print(sublists)
  print(len(max(sublists, key=len)))
  print(total)

if __name__ == '__main__':
  main()
