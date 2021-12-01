import re

INITIAL_STATE = re.compile('initial state: ([.#]+)')
RULE = re.compile('([\\.#]{5}) => ([.#])')

POT = {'.': False, '#': True}

def parse(pots):
  return tuple(map(lambda pot: POT[pot], pots))

def main():
  with open('input.txt', 'r') as f:
  #with open('sample_input.txt', 'r') as f:
    lines = f.readlines()
  initial_state = dict(enumerate(parse(INITIAL_STATE.match(lines[0]).group(1))))
  rules = {}
  for line in lines[2:]:
    match = RULE.match(line)
    if parse(match.group(1)) in rules:
      raise Exception('Duplicate rule')
    rules[parse(match.group(1))] = POT[match.group(2)]
  if len(rules) != 2**5:
    raise Exception('Missing rules')
  if rules[(False, False, False, False, False)]:
    raise Exception('Invalid rule system')
  # Part 1
  final_state = state(initial_state, rules, 20)
  print sum(s for s in final_state if final_state[s])
  # Part 2
  target = int(50e9)
  time = 0
  step_size = 1000
  current_state = initial_state
  while time < target:
    current_state = state(current_state, rules, step_size)
    time += step_size
    print '%10d, %d' % (time, sum(s for s in current_state if current_state[s]))

def show(state):
  min_pos = min(s for s in state if state[s])
  max_pos = max(s for s in state if state[s])
  print '%3d: ' % min_pos,
  for i in xrange(min_pos, max_pos + 1):
    print ['.', '#'][state[i]],
  print

def state(initial_state, rules, steps):
  current_state = initial_state
  for i in xrange(steps):
    #if i % int(1e4) == 0:
    #  print 'progress = %f' % (i * 1.0 / steps)
    min_pos = min(s for s in current_state if current_state[s]) - 2
    max_pos = max(s for s in current_state if current_state[s]) + 2
    new_state = {}
    for pos in xrange(min_pos, max_pos + 1):
      context = tuple([current_state.get(p, False) for p in xrange(pos-2, pos+3)])
      new_state[pos] = rules[context]
    current_state = new_state
  return current_state

if __name__ == '__main__':
  main()
