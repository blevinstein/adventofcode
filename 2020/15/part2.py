
def next_value(lst):
  try:
    return lst[-2::-1].index(lst[-1]) + 1
  except ValueError:
    return 0

def main():
  #input = [0,3,6]
  input = [2,0,6,12,1,3]

  last_seen = {}

  # starting values
  time = 0
  for i in input[:-1]:
    last_seen[i] = time
    time += 1

  last_value = input[-1]
  #while time < 2020 - 1:
  while time < 30_000_000 - 1:
    if time % 1_000_000 == 0:
      print('t = %d' % time)
    #print((last_seen, last_value))
    next_value = time - last_seen.get(last_value) if last_value in last_seen else 0
    last_seen[last_value] = time
    time += 1
    last_value = next_value
  print(last_value)

if __name__ == '__main__':
  main()
