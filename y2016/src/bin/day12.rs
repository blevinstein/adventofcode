
use std::env;
use std::fs;
use std::collections::HashMap;

#[derive(Debug,Copy,Clone,Eq,PartialEq,Hash)]
struct Register(char);

impl Register {
  fn parse(raw: &str) -> Register {
    match raw.chars().nth(0) {
      Some(a) if a.is_alphabetic() => Register(a),
      _ => panic!("Expected register, got: {}", raw),
    }
  }
}

#[derive(Debug,Copy,Clone,Eq,PartialEq,Hash)]
enum Arg {
  Value(isize),
  Reg(Register),
}

impl Arg {
  fn parse(raw: &str) -> Arg {
    match raw.chars().nth(0) {
      Some(a) if a.is_alphabetic() => Arg::Reg(Register(a)),
      Some(_) => Arg::Value(raw.parse().unwrap()),
      _ => panic!("Unexpected argument"),
    }
  }
}

#[derive(Debug,Copy,Clone,Eq,PartialEq,Hash)]
enum Instruction {
  Copy(Arg, Register),
  Inc(Register),
  Dec(Register),
  Jump(Arg, Arg),
}

type Registers = HashMap<char,isize>;

fn value_of(arg: &Arg, registers: &Registers) -> isize {
  match arg {
    Arg::Value(v) => *v,
    Arg::Reg(Register(r)) => *registers.get(&r).unwrap_or(&0),
  }
}

fn run(instructions: &Vec<Instruction>, initial_registers: &Registers) -> Registers {
  let mut registers: Registers = initial_registers.clone();
  let mut instruction_pointer: isize = 0;

  loop {
    if instruction_pointer < 0 {
      panic!("Instruction pointer is negative");
    } else if instruction_pointer >= instructions.len() as isize {
      return registers;
    }

    match instructions[instruction_pointer as usize] {
      Instruction::Copy(a, Register(r)) => {
        registers.insert(r, value_of(&a, &registers));
        instruction_pointer += 1;
      },
      Instruction::Inc(Register(r)) => {
        registers.insert(r, *registers.get(&r).unwrap_or(&0) + 1);
        instruction_pointer += 1;
      },
      Instruction::Dec(Register(r)) => {
        registers.insert(r, *registers.get(&r).unwrap_or(&0) - 1);
        instruction_pointer += 1;
      },
      Instruction::Jump(a, b) => {
        if value_of(&a, &registers) != 0 {
          instruction_pointer += value_of(&b, &registers);
        } else {
          instruction_pointer += 1;
        }
      },
    }
  }
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input: Vec<Instruction> = raw_input.trim().split("\n")
      .map(|line| {
        let mut part_iter = line.split(" ");
        match part_iter.next() {
          Some("cpy") => Instruction::Copy(
            Arg::parse(part_iter.next().unwrap()),
            Register::parse(part_iter.next().unwrap())),
          Some("inc") => Instruction::Inc(Register::parse(part_iter.next().unwrap())),
          Some("dec") => Instruction::Dec(Register::parse(part_iter.next().unwrap())),
          Some("jnz") => Instruction::Jump(
            Arg::parse(part_iter.next().unwrap()),
            Arg::parse(part_iter.next().unwrap())),
          _ => panic!("Unknown instruction"),
        }
      })
      .collect();

  println!("Part 1: result is {}", run(&input, &HashMap::new()).get(&'a').unwrap_or(&0));
  println!("Part 2: result is {}", run(&input, &vec![('c', 1)].into_iter().collect()).get(&'a').unwrap_or(&0));
}
