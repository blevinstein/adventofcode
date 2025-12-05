use std::env;
use std::fs;

#[derive(Debug)]
enum Dir {
    U,
    L,
    D,
    R,
}

impl Dir {
    fn parse(c: &char) -> Dir {
        match c {
            'U' => Dir::U,
            'L' => Dir::L,
            'D' => Dir::D,
            'R' => Dir::R,
            _ => panic!("Invalid direction"),
        }
    }

    fn modify(&self, key: u32) -> u32 {
        match self {
            Dir::U => if key > 3 { key - 3 } else { key },
            Dir::D => if key < 7 { key + 3 } else { key },
            Dir::L => if key % 3 == 1 { key } else { key - 1},
            Dir::R => if key % 3 == 0 { key } else { key + 1},
        }
    }

    fn modify2(&self, key: char) -> char {
        match key {
            '1' => match self {
                Dir::D => '3',
                _ => '1',
            },
            '2' => match self {
                Dir::D => '6',
                Dir::R => '3',
                _ => '2',
            },
            '3' => match self {
                Dir::U => '1',
                Dir::D => '7',
                Dir::L => '2',
                Dir::R => '4',
            },
            '4' => match self {
                Dir::D => '8',
                Dir::L => '3',
                _ => '4',
            },
            '5' => match self {
                Dir::R => '6',
                _ => '5',
            }
            '6' => match self {
                Dir::U => '2',
                Dir::D => 'A',
                Dir::L => '5',
                Dir::R => '7',
            },
            '7' => match self {
                Dir::U => '3',
                Dir::D => 'B',
                Dir::L => '6',
                Dir::R => '8',
            },
            '8' => match self {
                Dir::U => '4',
                Dir::D => 'C',
                Dir::L => '7',
                Dir::R => '9',
            },
            '9' => match self {
                Dir::L => '8',
                _ => '9',
            },
            'A' => match self {
                Dir::U => '6',
                Dir::R => 'B',
                _ => 'A',
            },
            'B' => match self {
                Dir::U => '7',
                Dir::L => 'A',
                Dir::R => 'C',
                Dir::D => 'D',
            },
            'C' => match self {
                Dir::U => '8',
                Dir::L => 'B',
                _ => 'C',
            },
            'D' => match self {
                Dir::U => 'B',
                _ => 'D',
            },
            _ => panic!("Unexpected key"),
        }
    }
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");
    let instructions: Vec<Vec<Dir>> = raw_input.trim().split("\n")
        .map(|line| line.chars().map(|c| Dir::parse(&c)).collect())
        .collect();

    // Part 1
    let mut current = 5;
    let mut output = vec![0; instructions.len()];
    for (i, row) in instructions.iter().enumerate() {
        for cell in row {
            current = cell.modify(current);
        }
        output[i] = current;
    }
    println!("{}", output.iter().map(|num| num.to_string()).collect::<Vec<String>>().join(""));

    // Part 2
    let mut current = '5';
    let mut output = vec!['x'; instructions.len()];
    for (i, row) in instructions.iter().enumerate() {
        for cell in row {
            current = cell.modify2(current);
        }
        output[i] = current;
    }
    println!("{}", output.iter().collect::<String>());
}
