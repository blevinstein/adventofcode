
def main():
  with open('input.txt', 'r') as f:
    lines = f.readlines()
    if len(lines) != 2:
      raise Exception('Unexpected input length')
    min_time = int(lines[0])
    buses = [int(bus) for bus in lines[1].split(',') if bus != 'x']

  def wait_time(bus):
    return -min_time % bus

  min_bus = min(buses, key=wait_time)
  print(min_bus)
  print(wait_time(min_bus))
  print(min_bus * wait_time(min_bus))

if __name__ == '__main__':
  main()
