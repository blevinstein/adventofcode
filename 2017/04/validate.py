
def main():
  with open('input', 'r') as f:
    data = [line.split() for line in f.readlines()]

  print len(filter(is_valid, data))

def is_valid(passphrase):
  words = set()
  for word in passphrase:
    if word in words:
      return False
    words.add(word)
  return True

if __name__ == '__main__':
  main()

