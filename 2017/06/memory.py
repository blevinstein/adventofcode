
def main():
  with open('input', 'r') as f:
    data = [int(part) for part in f.read().split()]
  print get_steps(data)

def get_steps(banks):
  steps = 0
  history = set()
  while hashable(banks) not in history:
    history.add(hashable(banks))
    redistribute(banks)
    steps += 1
    print banks
  return steps

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
