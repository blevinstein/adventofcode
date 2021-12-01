
def main():
  with open('input', 'r') as f:
    input = f.read()
  print get_score_and_garbage(input)

def get_score_and_garbage(input):
  score = 0
  index = 0
  group_depth = 0
  inside_garbage = False
  garbage_count = 0
  while index < len(input):
    c = input[index]
    index += 1
    if inside_garbage:
      if c == '>':
        inside_garbage = False
      elif c == '!':
        index += 1 # skip next character
      else:
        garbage_count += 1
    else:
      if c == '{':
        group_depth += 1
      elif c == '<':
        inside_garbage = True
      elif c == '}':
        score += group_depth
        group_depth -= 1
  return (score, garbage_count)

if __name__=='__main__':
  main()
