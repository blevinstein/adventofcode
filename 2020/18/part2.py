
import re

NUMBER = re.compile('\d+')

# return an infix tree of operations, e.g.
# 1 + 2 * 3 + 4
# becomes
# (1, '+', (2, '*', (3, '+', 4)))
def parse_expression(input):
  tokens = []
  first_value, remainder = parse_value(input)
  tokens.append(first_value)
  while remainder.strip():
    operator, remainder = parse_operator(remainder)
    next_value, remainder = parse_value(remainder)
    tokens.append(operator)
    tokens.append(next_value)
  return build_tree(tokens)

# takes a flat list of tokens, e.g.
# [1, '+', 2, '*', 3, '+', 4]
# and returns an infix tree of operations
def build_tree(tokens):
  while len(tokens) > 3:
    if '+' in tokens:
      chosen_operator = tokens.index('+')
    else:
      chosen_operator = tokens.index('*')
    tokens[chosen_operator-1:chosen_operator+2] = [tuple(tokens[chosen_operator-1:chosen_operator+2])]
  return tokens

def parse_operator(input):
  input = input.strip()
  if input[0] in ['+', '*']:
    return input[0], input[1:]
  raise Exception('Could not parse operator from input: %s' % input)

def parse_value(input):
  input = input.strip()
  if input[0] == '(':
    end_paren = matching_parenthesis(input, 0)
    return parse_expression(input[1:end_paren]), input[end_paren+1:]
  else:
    match = NUMBER.match(input)
    if match:
      return int(match.group()), input[match.end():]
  raise Exception('Could not parse value from input: %s' % input)

def matching_parenthesis(input, position):
  if input[position] != '(':
    raise Exception('Bad input position')
  level = 1
  for i in range(position+1, len(input)):
    if input[i] == '(':
      level += 1
    elif input[i] == ')':
      level -= 1
      if level == 0:
        return i
  raise Exception('No matching parenthesis')

def eval(tree):
  if isinstance(tree, int):
    return tree
  elif len(tree) != 3:
    raise Exception('Bad eval input: %s' % tree)
  elif tree[1] == '+':
    return eval(tree[0]) + eval(tree[2])
  elif tree[1] == '*':
    return eval(tree[0]) * eval(tree[2])
  else:
    raise Exception('Unknown eval input: %s' % (tree))

def main():
  with open('input.txt') as f:
    #for line in f.readlines():
      #print('\n' + line.strip())
      #parsed = parse_expression(line)
      #print(parsed)
      #print(eval(parsed))
    expressions = [parse_expression(line) for line in f.readlines()]

  print(sum(eval(expr) for expr in expressions))

if __name__ == '__main__':
  main()
