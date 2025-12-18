
use std::env;
use std::fs;
use regex::Regex;
use core::array;

enum Instruction {
  Rect(usize,usize),
  RotateRow(usize,usize),
  RotateColumn(usize,usize),
}

type Screen = [[bool; 50]; 6];

fn display(state: &Screen) {
  state.iter().for_each(|row|
      println!("{}", row.iter().map(|&value| if value { '#' } else { ' ' }).collect::<String>()))
}

fn apply(before: &Screen, inst: &Instruction) -> Screen {
  array::from_fn(|y|
      array::from_fn(|x|
          match inst {
            Instruction::Rect(rx, ry) => (y < *ry && x < *rx) || before[y][x],
            Instruction::RotateRow(ry, pixels) => if y == *ry {
              before[y][(x as isize - *pixels as isize).rem_euclid(50) as usize]
            } else {
              before[y][x]
            },
            Instruction::RotateColumn(rx, pixels) => if x == *rx {
              before[(y as isize - *pixels as isize).rem_euclid(6) as usize][x]
            } else {
              before[y][x]
            },
          }))
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input: Vec<Instruction> = raw_input.trim().split("\n").map(|line| match line {
    s if s.starts_with("rect") => {
      let (_, coords) = s.split_once(" ").unwrap();
      let (x, y) = coords.split_once("x").unwrap();
      Instruction::Rect(x.parse::<usize>().unwrap(), y.parse::<usize>().unwrap())
    },
    s if s.starts_with("rotate row") => {
      let (_, params) = s.split_once("y=").unwrap();
      let (y, pixels) = params.split_once(" by ").unwrap();
      Instruction::RotateRow(y.parse::<usize>().unwrap(), pixels.parse::<usize>().unwrap())
    },
    s if s.starts_with("rotate column") => {
      let (_, params) = s.split_once("x=").unwrap();
      let (x, pixels) = params.split_once(" by ").unwrap();
      Instruction::RotateColumn(x.parse::<usize>().unwrap(), pixels.parse::<usize>().unwrap())
    },
    _ => panic!("Failed to parse line {}", line)
  }).collect();

  let initial_screen: Screen = [[false; 50]; 6];

  let final_screen = input.iter().fold(initial_screen, |acc, item| apply(&acc, item));

  println!("{} pixels are on", final_screen.iter()
      .map(|row| row.iter().filter(|value| **value).count())
      .sum::<usize>());

  display(&final_screen);
}
