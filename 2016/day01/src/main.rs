use std::env;
use std::fs;
use std::collections::HashSet;

#[derive(Debug)]
enum Turn {
    R,
    L,
}

impl Turn {
    fn parse(s: &str) -> Turn {
        match s {
            "R" => Turn::R,
            "L" => Turn::L,
            _ => panic!("Invalid turn"),
        }
    }
}

#[derive(Debug)]
enum Dir {
    N,
    E,
    S,
    W,
}

impl Dir {
    fn turn(&self, t: &Turn) -> Dir {
        match t {
            Turn::R => match self {
                Dir::N => Dir::E,
                Dir::E => Dir::S,
                Dir::S => Dir::W,
                Dir::W => Dir::N,
            },
            Turn::L => match self {
                Dir::N => Dir::W,
                Dir::W => Dir::S,
                Dir::S => Dir::E,
                Dir::E => Dir::N,
            },
        }
    }
}

#[derive(PartialEq, Eq, Hash, Debug, Clone)]
struct Pos {
    x: i32,
    y: i32,
}

impl Pos {
    fn advance(&self, d: &Dir, amount: u32) -> Pos {
        match d {
            Dir::N => Pos { x: self.x, y: self.y + (amount as i32) },
            Dir::S => Pos { x: self.x, y: self.y - (amount as i32) },
            Dir::E => Pos { x: self.x + (amount as i32), y: self.y },
            Dir::W => Pos { x: self.x - (amount as i32), y: self.y },
        }
    }
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");
    let instructions: Vec<(Turn, u32)> = raw_input
        .trim()
        .split(", ")
        .map(|line| (Turn::parse(&line[..1]), line[1..].parse().unwrap()))
        .collect();

    // Part 1
    {
        let mut state: (Dir, Pos) = (Dir::N, Pos { x: 0, y: 0 });
        for instruction in &instructions {
            state.0 = state.0.turn(&instruction.0);
            state.1 = state.1.advance(&state.0, instruction.1);
        }
        println!("blocks away: {}", state.1.x.abs() + state.1.y.abs());
    }

    // Part 2
    {
        let mut visited = HashSet::new();
        let mut state: (Dir, Pos) = (Dir::N, Pos { x: 0, y: 0 });
        'outer: for instruction in &instructions {
            state.0 = state.0.turn(&instruction.0);
            for _ in 0..instruction.1 {
                state.1 = state.1.advance(&state.0, 1);
                if visited.contains(&state.1) {
                    println!("Visited twice: {:?} dist {}", state.1, state.1.x.abs() + state.1.y.abs());
                    break 'outer;
                }
                visited.insert(state.1.clone());
            }
        }
    }
}
