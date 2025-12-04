
use std::env;
use std::fs;

enum Direction {
    Left,
    Right,
}

struct Rotation {
    dir: Direction,
    distance: i32,
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");

    let input: Vec<Rotation> = raw_input
        .split("\n")
        .filter(|line| line.len() > 0)
        .map(|line| Rotation {
            dir: match line.chars().nth(0).unwrap() {
                'L' => Direction::Left,
                'R' => Direction::Right,
                _ => panic!("Unexpected direction"),
            },
            distance: line[1..].parse::<i32>().unwrap(),
        })
        .collect();

    let mut dial: i32 = 50;

    let mut zero_count: i32 = 0;
    let mut moving_zero_count: i32 = 0;

    for rotation in input.iter() {
        match rotation.dir {
            Direction::Left => {
                if rotation.distance >= dial {
                    if dial > 0 { moving_zero_count += 1; }
                    moving_zero_count += (rotation.distance - dial) / 100;
                }
                dial -= rotation.distance;
            },
            Direction::Right => {
                if rotation.distance >= (100 - dial) {
                    moving_zero_count += (rotation.distance - (100 - dial)) / 100 + 1;
                }
                dial += rotation.distance;
            },
        }
        while dial < 0 { dial += 100; }
        while dial >= 100 { dial -= 100; }
        if dial == 0 { zero_count += 1; }
    }

    println!("Zero count is {zero_count}");
    println!("Moving zero count is {moving_zero_count}");
}
