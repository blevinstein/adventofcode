use std::collections::HashSet;
use std::env;
use std::fs;

use y2024::Pos;

const DIRECTIONS: [Pos; 4] = [
    Pos { x: 1, y: 0 },
    Pos { x: -1, y: 0 },
    Pos { x: 0, y: 1 },
    Pos { x: 0, y: -1 },
];

fn floodfill(grid: &Vec<Vec<char>>, start: &Pos) -> HashSet<Pos> {
    let mut result: HashSet<Pos> = HashSet::new();

    let height = grid.len();
    let width = grid[0].len();
    let in_bounds = |p: &Pos| 0 <= p.x && p.x < width as isize && 0 <= p.y && p.y < height as isize;

    let mut frontier = vec![*start];
    while !frontier.is_empty() {
        let current = frontier.pop().expect("Expectation violated");
        if result.contains(&current) {
            continue;
        }

        result.insert(current);
        for direction in DIRECTIONS {
            let new_space = current.add(&direction);
            if in_bounds(&new_space)
                && grid[new_space.y as usize][new_space.x as usize]
                    == grid[current.y as usize][current.x as usize]
                && !result.contains(&new_space)
            {
                frontier.push(new_space);
            }
        }
    }

    result
}

fn perimeter(region: &HashSet<Pos>) -> usize {
    let mut border: usize = 0;
    for square in region {
        for direction in DIRECTIONS {
            let new_square = square.add(&direction);
            if !region.contains(&new_square) {
                border += 1;
            }
        }
    }
    border
}

fn area(region: &HashSet<Pos>) -> usize {
    region.len()
}

fn count_sides(region: &HashSet<Pos>) -> usize {
    // First, get all of the side segments, storing the position AND normal direction
    let mut side_segments: Vec<(Pos, Pos)> = Vec::new();
    for square in region {
        for direction in DIRECTIONS {
            let new_square = square.add(&direction);
            if !region.contains(&new_square) {
                side_segments.push((new_square, direction));
            }
        }
    }

    // Next, count sides
    let mut sides: usize = 0;
    while !side_segments.is_empty() {
        // Pick one segment to start a new side
        let mut new_side = vec![side_segments.pop().expect("Logic error")];
        // Add all of the segments that connect to this side
        loop {
            let new_segment_index = side_segments
                .iter()
                .position(|new_seg|
                    new_side.iter().any(|old_seg|
                            old_seg.1 == new_seg.1
                            && old_seg.0.sub(&new_seg.0).manhattan_dist() == 1));
            match new_segment_index {
                None => break,
                Some(i) => new_side.push(side_segments.remove(i)),
            }
        }
        // Increment side count
        sides += 1;
    }

    sides
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let grid: Vec<Vec<char>> = raw_input
        .trim()
        .split("\n")
        .map(|line| line.chars().collect())
        .collect();
    let height = grid.len();
    let width = grid[0].len();

    let mut regions: Vec<HashSet<Pos>> = Vec::new();

    // Get the regions
    for y in 0..height {
        for x in 0..width {
            let p = Pos {
                x: x as isize,
                y: y as isize,
            };
            if !regions.iter().any(|r| r.contains(&p)) {
                regions.push(floodfill(&grid, &p));
            }
        }
    }

    // Part 1
    {
        let total_price = regions
            .iter()
            .map(|r| area(&r) * perimeter(&r))
            .reduce(|acc, el| acc + el)
            .expect("Sum failure");
        println!("Total price is {total_price}");
    }

    // Part 2
    {
        let total_price = regions
            .iter()
            .map(|r| area(&r) * count_sides(&r))
            .reduce(|acc, el| acc + el)
            .expect("Sum failure");
        println!("Total price is {total_price}");
    }
}
