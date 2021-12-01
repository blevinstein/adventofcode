
def reverse_loop_size(public_key):
  subject_number = 7
  loop_size = 0
  value = 1
  while value != public_key:
    value *= subject_number
    value %= 20201227
    loop_size += 1
  return loop_size

def transform_subject_number(loop_size, subject_number = 7):
  value = 1
  for i in range(loop_size):
    value *= subject_number
    value %= 20201227
  return value

def main():
  input = [10705932, 12301431]
  #input = [5764801, 17807724]

  loop_sizes = list(reverse_loop_size(key) for key in input)

  encryption_key = transform_subject_number(loop_sizes[0], input[1])
  print(encryption_key)

if __name__ == '__main__':
  main()
