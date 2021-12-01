
def main():
  with open('input', 'r') as f:
    data = [int(part) for part in f.read().split()]
  print get_cycle_len(data)

def get_cycle_len(banks):
  steps = 0
  history = {}
  while hashable(banks) not in history:
    history[hashable(banks)] = steps
    redistribute(banks)
    steps += 1
    print banks
  return steps - history[hashable(banks)]

def hashable(banks):
  return '.'.join([str(bank) for bank in banks])

def redistribute(banks):
  start_index = max(xrange(len(banks)), key=lambda i: [banks[i], -i])
  amount = banks[start_index]
  banks[start_index] = 0
  for i in xrange(amount):
    banks[(start_index + i + 1) % len(banks)] += 1

if __name__ == '__main__':
  main()
