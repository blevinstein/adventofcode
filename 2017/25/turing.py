import re

BLOCK_SPLITTER = re.compile('\n\n')

HEADER = re.compile('Begin in state (?P<initial_state>\w)\.\n' +
    'Perform a diagnostic checksum after (?P<checksum_step>\d+) steps\.')

RULE = re.compile('In state (?P<state>\w):\n' +
    '\s*If the current value is (?P<value_0>\d):\n' +
    '\s*- Write the value (?P<write_0>\d).\n' +
    '\s*- Move one slot to the (?P<move_0>\w+).\n' +
    '\s*- Continue with state (?P<new_state_0>\w).\n' +
    '\s*If the current value is (?P<value_1>\d):\n' +
    '\s*- Write the value (?P<write_1>\d).\n' +
    '\s*- Move one slot to the (?P<move_1>\w+).\n' +
    '\s*- Continue with state (?P<new_state_1>\w).')

DIRS = {'left': -1, 'right': 1}

def main():
  with open('input', 'r') as f:
    blocks = BLOCK_SPLITTER.split(f.read())
    header = HEADER.match(blocks[0]).groupdict()
    rulelist = [RULE.match(block).groupdict() for block in blocks[1:]]
    rulemap = {rule['state']: {
          0: {'write': int(rule['write_0']),
            'move': DIRS[rule['move_0']],
            'new_state': rule['new_state_0']},
          1: {'write': int(rule['write_1']),
            'move': DIRS[rule['move_1']],
            'new_state': rule['new_state_1']}
        } for rule in rulelist}
  current_state = header['initial_state']
  current_position = 0
  checksum = 0
  tape = {}
  for i in xrange(int(header['checksum_step'])):
    if i % 100000 == 0:
      print 'Iteration %d' % i

    rule = rulemap[current_state]
    value = tape.get(current_position, 0)
    option = rule[value]

    new_value = option['write']
    checksum += new_value - value
    tape[current_position] = new_value
    current_position += option['move']
    current_state = option['new_state']
  print checksum

if __name__=='__main__':
  main()
