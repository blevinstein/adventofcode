
def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
  input = lines[0].strip()
  # Part 1
  #print len(react(input))
  # Part 2
  print min(len(react(input.replace(letter.upper(), '').replace(letter.lower(), '')))
      for letter in 'abcdefghijklmnopqrstuvwxyz')

def react(initial):
  value = initial
  i = 0
  while i < len(value) - 1:
    if match(value[i], value[i+1]):
      value = value[:i] + value[i+2:]
      i = max(i-1, 0)
    else:
      i += 1
  return value

def match(a, b):
  return a.upper() == b.upper() and a != b

if __name__ == '__main__':
  main()
