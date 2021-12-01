
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

  # local method, captures [fields]
  def is_invalid(value):
    for ranges in fields.values():
      for range in ranges:
        if contains(range, value):
          return False
    return True

  print(fields)
  print(tickets)

  error_value = 0
  for ticket in tickets:
    for value in ticket:
      if is_invalid(value):
        error_value += value
  print(error_value)

if __name__ == '__main__':
  main()
