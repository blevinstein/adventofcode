use std::env;
use std::fs;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug,Eq,PartialEq,Hash,Copy,Clone)]
struct Pos {
    x: isize,
    y: isize,
}

impl Pos {
    fn sub(&self, other: &Pos) -> Pos {
        Pos { x: self.x - other.x, y: self.y - other.y }
    }

    fn add(&self, other: &Pos) -> Pos {
        Pos { x: self.x + other.x, y: self.y + other.y }
    }

    fn mul(&self, scalar: isize) -> Pos {
        Pos { x: self.x * scalar, y: self.y * scalar }
    }
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let grid: Vec<Vec<char>> = raw_input.trim().split("\n")
        .map(|line| line.chars().collect())
        .collect();

    let width = grid[0].len() as isize;
    let height = grid.len() as isize;

    let in_bounds = |pos: &Pos| 0 <= pos.x && pos.x < width && 0 <= pos.y && pos.y < height;

    let mut antennas: HashMap<char, Vec<Pos>> = HashMap::new();

    for y in 0..height {
        for x in 0..width {
            match grid[y as usize][x as usize] {
                '.' => (),
                c => antennas.entry(c).or_insert_with(Vec::new).push(Pos{ x, y }),
            }
        }
    }

    // Part 1
    {
        let mut antinodes = HashSet::new();

        for (_letter, positions) in antennas.iter() {
            for i in 0..positions.len() {
                for j in 0..positions.len() {
                    if i == j { continue }
                    let a = positions[i];
                    let b = positions[j];
                    let node_a = a.mul(2).sub(&b);
                    let node_b = b.mul(2).sub(&a);
                    if in_bounds(&node_a) {
                        antinodes.insert(node_a);
                    }
                    if in_bounds(&node_b) {
                        antinodes.insert(node_b);
                    }
                }
            }
        }
        println!("Found {} unique antinodes", antinodes.len());
    }

    // Part 2
    {
        let mut antinodes = HashSet::new();

        for (_letter, positions) in antennas.iter() {
            for i in 0..positions.len() {
                for j in 0..positions.len() {
                    if i == j { continue }
                    let a = positions[i];
                    let b = positions[j];
                    let diff = a.sub(&b);

                    // Extend from a end
                    let mut steps = 0;
                    loop {
                        let node = diff.mul(steps).add(&a);
                        if !in_bounds(&node) { break; }
                        antinodes.insert(node);
                        steps += 1;
                    }
                    // Extend from b end
                    steps = 0;
                    loop {
                        let node = diff.mul(-steps).add(&b);
                        if !in_bounds(&node) { break; }
                        antinodes.insert(node);
                        steps += 1;
                    }
                }
            }
        }
        println!("Found {} unique antinodes", antinodes.len());
    }
}
