
import re
import inspect

MASK = re.compile(r"mask = ([X10]{36})")
MEM = re.compile(r"mem\[(\d+)\] = (\d+)")

def count_bits(mask):
  bits = 0
  value = mask
  while value:
    value = value & (value - 1)
    bits += 1
  return bits

def all_subsets(mask):
  if mask == 0:
    return [0]
  if count_bits(mask) > 10:
    print('Warning, 2^%d subsets' % count_bits(mask))
  if count_bits(mask) > 20:
    raise Exception('Abort, 2^%d subsets' % count_bits(mask))
  low_bit = mask - (mask & (mask - 1))
  # recurse, then double the result and add back the low bit
  recur_subsets = all_subsets(mask ^ low_bit)
  return recur_subsets + [r | low_bit for r in recur_subsets]

# NOTE: This is overloaded, both to represent (or_mask, all_mask) combinations before being applied
# to a particular address, AND to represent (value, all_mask) combinations that have been already
# been computed by applying a particular address.
class Mask(object):
  def __init__(self, or_mask, all_mask):
    if or_mask & all_mask:
      raise Exception('or_mask & all_mask = 0 for valid masks; got %d' % (or_mask & all_mask))
    self.or_mask = or_mask
    self.all_mask = all_mask

  # takes a raw mask as an argument, e.g. X11X00... (36 bits)
  @staticmethod
  def compile(mask):
    if len(mask) != 36:
      raise Exception('Unexpected mask length')
    or_mask = 0
    all_mask = 0
    for i, bit in enumerate(mask):
      power = 35 - i
      if bit == '1':
        or_mask |= (1 << power)
      elif bit == 'X':
        all_mask |= (1 << power)
      elif bit != '0':
        raise Exception('Unexpected bit in mask: %s' % bit)
    #print('compiled! or_mask = %s all_mask = %s' % (bin(or_mask), bin(all_mask)))
    return Mask(or_mask, all_mask)

  def __str__(self):
    result = ''
    for i in range(35, -1, -1):
      if self.all_mask & (1 << i):
        result += 'X'
      elif self.or_mask & (1 << i):
        result += '1'
      else:
        result += '0'
    return result

  def __repr__(self):
    result = 'Mask['
    for i in range(35, -1, -1):
      if self.all_mask & (1 << i):
        result += 'X'
      elif self.or_mask & (1 << i):
        result += '1'
      else:
        result += '0'
    result += ']'
    return result

  def __hash__(self):
    return hash((self.or_mask, self.all_mask))

  def __eq__(self, other):
    if isinstance(other, Mask):
      return self.or_mask == other.or_mask and self.all_mask == other.all_mask
    return False

  # return a Mask with or_mask and all_mask applied to an address
  def apply(self, address):
    # Note: we zero all bits in the all_mask, to ensure that or_mask & all_mask = 0 for all Masks
    return Mask((address & (~self.all_mask)) | (self.or_mask), self.all_mask)

  def overlaps(self, address_mask):
    if not isinstance(address_mask, Mask):
      raise Exception('Unexpected input! %s' % address_mask)
    # different bits not covered by any all_mask => no overlap
    if (self.or_mask ^ address_mask.or_mask) & ~(self.all_mask | address_mask.all_mask):
      return False
    return True

  def contains(self, address_mask):
    if not self.overlaps(address_mask):
      return False
    if address_mask.all_mask & ~self.all_mask:
      return False
    return True

  # splits self into multiple values according to the given bitmask (wherever it has a 1, we split
  # along that bit, which MUST be in all_mask) and return a list of Masks
  def split(self, split_mask):
    if split_mask & ~self.all_mask:
      raise Exception('Cannot split beyond own all_mask!')
    sub_masks = all_subsets(split_mask)
    return [Mask(self.or_mask ^ sub_mask, self.all_mask ^ split_mask) for sub_mask in sub_masks]

def parse_line(line):
  mask_match = MASK.fullmatch(line)
  if mask_match:
    return ('mask', mask_match.groups()[0])
  mem_match = MEM.fullmatch(line)
  if mem_match:
    return ('mem', int(mem_match.groups()[0]), int(mem_match.groups()[1]))
  raise Exception('Unrecognized instruction: %s' % line)

def run_program(program):
  memory = {}

  # subprocedure for writing to memory
  def write_memory(address, value):
    # check for existing addresses that need to be overwritten, in whole or part
    memory_cells = list(memory.items())
    for old_address, old_value in memory_cells:
      if not address.overlaps(old_address):
        continue

      # remove old contents from memory
      del memory[old_address]

      if address.contains(old_address):
        #print('Overwrite old address (%s)' % (old_address))
        memory[old_address] = 0
      else:
        # split where old_address has an X, but address does not
        split_addresses = old_address.split(old_address.all_mask & ~(address.all_mask))
        #print('Split (%s) into %d parts' % (old_address, len(split_addresses)))
        for split_address in split_addresses:
          # write back selectively
          if not address.contains(split_address):
            #print('Write back value (%d) to split address (%s)' % (old_value, split_address))
            memory[split_address] = old_value
          #else:
            #print('Overwrite split address (%s)' % (split_address))
    #print('Write new value (%d) to address (%s)' % (value, address))
    memory[address] = value

  # initial mask does not transform the value
  mask = Mask(0, 0)
  for step in program:
    if step[0] == 'mask':
      mask = Mask.compile(step[1])
    elif step[0] == 'mem':
      address = mask.apply(step[1])
      write_memory(address, step[2])
  return memory

def sum_memory(memory):
  result = 0
  for address, value in memory.items():
    multiple = (1 << count_bits(address.all_mask))
    result += multiple * value
  return result

def main():
  with open('input.txt', 'r') as f:
    program = [parse_line(line.strip()) for line in f.readlines()]
  memory = run_program(program)
  print(memory)
  print(sum_memory(memory))

if __name__ == '__main__':
  main()
