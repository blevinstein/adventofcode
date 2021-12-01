
import re

LETTER = re.compile(r"\"(\w)\"")

def main():
  with open('input2.txt') as f:
    rules_input, messages_input = f.read().split('\n\n')

    rules = {}
    for line in rules_input.strip().split('\n'):
      id, rule = line.strip().split(': ')
      if rule[0] == '"':
        rules[int(id)] = rule[1]
      else:
        rules[int(id)] = [[int(value) for value in subrule.split()] for subrule in rule.split(' | ')]

    messages = messages_input.strip().split('\n')

  def complete_match(rule_ids, message):
    #print('Matching rule IDs %s against %s' % (rule_ids, message))
    if not rule_ids and not message:
      return True
    if not rule_ids or not message:
      return False
    next_rule = rules[rule_ids[0]]

    if isinstance(next_rule, str):
      return message[0] == next_rule and complete_match(rule_ids[1:], message[1:])
    else:
      for candidate_rule_ids in next_rule:
        if complete_match(candidate_rule_ids + rule_ids[1:], message):
          return True
    return False

  matched = 0
  for message in messages:
    if complete_match([0], message):
      print('Matched: %s' % message)
      matched += 1
  print(matched)


if __name__ == '__main__':
  main()

