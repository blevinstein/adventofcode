
use std::env;
use std::fs;
use regex::Regex;

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let splitter = Regex::new(r"\s+").unwrap();

  let lines: Vec<&str> = raw_input.trim().split("\n").collect();

  let args: Vec<Vec<usize>> = lines[0..(lines.len()-1)].iter()
      .map(|line| splitter.split(line)
          .filter(|num| num.len() > 0)
          .map(|num| num.parse::<usize>().expect("Failed to parse number"))
          .collect())
      .collect();

  let operators: Vec<char> = splitter.split(lines[lines.len() - 1])
      .map(|operator| operator.chars().nth(0).unwrap())
      .collect();

  //println!("Args {args:?} operators {operators:?}");

  let answers: Vec<usize> = (0..args[0].len())
      .map(|i| args.iter().map(|row| row[i]).reduce(|acc, el| match operators[i] {
        '*' => acc * el,
        '+' => acc + el,
        _ => panic!("Unexpected operator"),
      }).unwrap())
      .collect();

  let sum: usize = answers.iter().sum();
  println!("Sum of all answers is {sum}");

  // Part 2, re-parse inputs

  let digits: Vec<Vec<Option<usize>>> = lines[0..(lines.len()-1)].iter()
      .map(|line| line.chars()
          .map(|digit| if digit == ' ' { None } else { Some(digit as usize - '0' as usize) })
          .collect())
      .collect();

  let mut new_args: Vec<Option<usize>> = (0..(digits[0].len()))
      .map(|x| (0..(digits.len()))
          .map(|y| digits[y][x])
          .flatten()
          .reduce(|acc, el| acc * 10 + el))
      .collect();
  new_args.push(None);

  //println!("New args are {new_args:?}");

  let mut new_answers: Vec<usize> = vec![];
  let mut operator_index = 0;
  let mut temp_args: Vec<usize> = vec![];
  for new_arg in new_args {
    match new_arg {
      Some(arg) => {
        temp_args.push(arg);
      },
      None => {
        new_answers.push(temp_args.into_iter().reduce(|acc, el| match operators[operator_index] {
          '*' => acc * el,
          '+' => acc + el,
          _ => panic!("Unexpected operator"),
        }).unwrap());
        temp_args = vec![];
        operator_index += 1;
      },
    }
  }

  //println!("New answers are {new_answers:?}");

  let new_sum: usize = new_answers.iter().sum();
  println!("Sum of new answers is {new_sum}");
}
