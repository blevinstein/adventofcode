
def main():
  with open('input', 'r') as f:
    data = [line.split() for line in f.readlines()]

  print len(filter(is_valid, data))

def is_anagram(a, b):
  counts = {}
  for c in a:
    counts[c] = counts.get(c, 0) + 1
  for c in b:
    counts[c] = counts.get(c, 0) - 1
  for v in counts.values():
    if v != 0:
      return False
  return True

def is_valid(passphrase):
  for i in xrange(len(passphrase)):
    for j in xrange(len(passphrase)):
      if i != j and is_anagram(passphrase[i], passphrase[j]):
        return False
  return True

if __name__ == '__main__':
  main()

