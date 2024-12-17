use std::env;
use std::fs;
use regex::Regex;

use y2024::Pos;

fn wrap(bounds: &Pos, point: &Pos) -> Pos {
    let mut tx = point.x % bounds.x;
    if tx < 0 { tx += bounds.x }
    let mut ty = point.y % bounds.y;
    if ty < 0 { ty += bounds.y }
    Pos { x: tx, y: ty }
}

struct Robot {
    position: Pos,
    velocity: Pos,
}

impl Robot {
    fn at_time(&self, time: isize) -> Pos {
        Pos {
            x: self.position.x + self.velocity.x * time,
            y: self.position.y + self.velocity.y * time,
        }
    }
}

fn draw(positions: &Vec<Pos>, bounds: &Pos) {
    for y in 0..bounds.y {
        for x in 0..bounds.x {
            if positions.iter().any(|p| *p == Pos { x, y }) {
                print!("#");
            } else {
                print!(".");
            }
        }
        println!("");
    }
    println!("");
}

fn safety_factor(positions: &Vec<Pos>, bounds: &Pos) -> usize {
    let mut quadrants = [0; 4];
    for position in positions {
        if position.x*2 == bounds.x-1 || position.y*2 == bounds.y-1 { continue }

        if position.x*2 < bounds.x {
            if position.y*2 < bounds.y {
                quadrants[0] += 1;
            } else {
                quadrants[1] += 1;
            }
        } else {
            if position.y*2 < bounds.y {
                quadrants[2] += 1;
            } else {
                quadrants[3] += 1;
            }
        }
    }
    quadrants.iter().fold(1, |acc, el| acc * (*el))
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let bounds = if env::args().count() >= 4 {
        Pos {
            x: env::args().nth(2).unwrap().parse().expect("Parse width failed"),
            y: env::args().nth(3).unwrap().parse().expect("Parse width failed"),
        }
    } else {
        Pos { x: 101, y: 103 }
    };

    let line_re = Regex::new(r"p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)").expect("Regex parsing failed");

    let robots: Vec<Robot> = raw_input.trim().split("\n")
        .map(|line| {
            let line_captures = line_re.captures(line).expect("Regex match failed");
            Robot {
                position: Pos {
                    x: line_captures.get(1).unwrap().as_str().parse().unwrap(),
                    y: line_captures.get(2).unwrap().as_str().parse().unwrap(),
                },
                velocity: Pos {
                    x: line_captures.get(3).unwrap().as_str().parse().unwrap(),
                    y: line_captures.get(4).unwrap().as_str().parse().unwrap(),
                }
            }
        })
        .collect();

    // Part 1
    let position_list: Vec<Pos> = robots.iter().map(|robot| wrap(&bounds, &robot.at_time(100))).collect();
    println!("Safety factor is {}", safety_factor(&position_list, &bounds));

    // Part 2 - exploration
    /*
    let mut buffer = String::new();
    let mut step = 0;
    let stdin = io::stdin();
    loop {
        let step_positions: Vec<Pos> = robots.iter().map(|robot| wrap(&bounds, &robot.at_time(step))).collect();
        draw(&step_positions, &bounds);
        println!("t={step}");
        stdin.read_line(&mut buffer);
        step += 1;
    }
    */

    // Part 2
    let initial_positions: Vec<Pos> = robots.iter().map(|robot| wrap(&bounds, &robot.at_time(0))).collect();
    let mut min_safety_factor = safety_factor(&initial_positions, &bounds);
    let mut min_safety_step = 0;
    for step in 0..10000 {
        let step_positions: Vec<Pos> = robots.iter().map(|robot| wrap(&bounds, &robot.at_time(step))).collect();
        let step_safety_factor = safety_factor(&step_positions, &bounds);
        if step_safety_factor < min_safety_factor {
            min_safety_step = step;
            min_safety_factor = step_safety_factor;
        }
    }
    println!("Lowest safety at step {min_safety_step}:");
    let min_safety_positions: Vec<Pos> = robots.iter().map(|robot| wrap(&bounds, &robot.at_time(min_safety_step))).collect();
    draw(&min_safety_positions, &bounds);
}
