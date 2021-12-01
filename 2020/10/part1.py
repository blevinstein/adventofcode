
def main():
  with open('input.txt', 'r') as f:
    input = [int(line.strip()) for line in f.readlines()]
  # sort by joltage
  input.sort()
  # append built-in adapter
  input.append(input[-1] + 3)

  print(input)
  # compute differences
  last_joltage = 0
  diff_count = {}
  for adapter in input:
    joltage_diff = adapter - last_joltage
    if joltage_diff > 3:
      raise Exception('Missing joltage adapter! %d to %d' % (last_joltage, adapter))
    last_joltage = adapter
    diff_count[joltage_diff] = diff_count.get(joltage_diff, 0) + 1
  print(diff_count[1] * diff_count[3])

if __name__ == '__main__':
  main()
