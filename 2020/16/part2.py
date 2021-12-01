
def parse_range(range_str):
  values = [int(v) for v in range_str.split('-')]
  if len(values) > 2:
    raise Exception('Bad range: %s' % (range_str))
  if values[1] <= values[0]:
    raise Exception('Reversed range: %s' % (values))
  return values

def parse_field(field_str):
  label, range_str = field_str.split(': ')
  ranges = [parse_range(r) for r in range_str.split(' or ')]
  return (label, ranges)

def contains(range, value):
  return value >= range[0] and value <= range[1]

def parse_ticket(ticket_str):
  return [int(t) for t in ticket_str.split(',')]

def main():
  with open('input.txt', 'r') as f:
    input = f.read().strip().split('\n\n')
    fields = dict(parse_field(field) for field in input[0].split('\n'))
    tickets = [parse_ticket(ticket) for ticket in input[2].split('\n')[1:]]
    my_ticket = parse_ticket(input[1].split('\n')[1])

  # local method, captures [fields]
  def is_valid_ticket(ticket):
    for value in ticket:
      is_invalid = True
      for ranges in fields.values():
        for range in ranges:
          if contains(range, value):
            is_invalid = False
      if is_invalid:
        return False
    return True

  # local method, captures [fields]
  def is_valid_field(label, value):
    for range in fields[label]:
      if contains(range, value):
        return True
    return False

  # remove invalid tickets
  print('Total tickets: %d' % len(tickets))
  tickets = list(filter(is_valid_ticket, tickets))
  print('Valid tickets: %d' % len(tickets))

  for label, ranges in fields.items():
    print('%20s\t%s' % (label, ' or '.join(('%d-%d' % (r[0], r[1])) for r in ranges)))

  # create a sieve
  ticket_size = len(tickets[0])
  candidates = {}
  for label in fields.keys():
    candidates[label] = set(range(ticket_size))
  # remove invalid entries
  for ticket in tickets:
    for label in fields.keys():
      candidate_indexes = list(candidates[label])
      for candidate_index in candidate_indexes:
        if not is_valid_field(label, ticket[candidate_index]):
          print('%s cannot be index %d according to ticket %s' % (label, candidate_index, ticket))
          candidates[label].remove(candidate_index)

  # simplify using exclusion
  excluded = set()
  changing = True
  while changing:
    changing = False
    for label in set(fields.keys()) - excluded:
      if len(candidates[label]) == 1:
        index = list(candidates[label])[0]
        print('%s must be %d, excluding all others' % (label, index))
        excluded.add(label)
        changing = True
        for other_label in set(fields.keys()):
          if other_label != label:
            candidates[other_label].discard(index)

  mapping = {}
  for label in fields.keys():
    if len(candidates[label]) > 1:
      raise Exception('Uncertain label! %s' % label)
    mapping[label] = list(candidates[label])[0]

  print(mapping)
  print(my_ticket)

  answer = 1
  for label, index in mapping.items():
    if label.startswith('departure'):
      print('%20s => %d' % (label, my_ticket[index]))
      answer *= my_ticket[index]
  print(answer)

if __name__ == '__main__':
  main()
