
def next_value(lst):
  try:
    return lst[-2::-1].index(lst[-1]) + 1
  except ValueError:
    return 0

def main():
  #input = [0,3,6]
  input = [9,19,1,6,0,5,4]
  while len(input) < 2020:
    next = next_value(input)
    input.append(next)
  print(input)

if __name__ == '__main__':
  main()
