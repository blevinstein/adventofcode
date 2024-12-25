use std::env;
use std::fs;

#[derive(Eq, PartialEq, Hash, Debug, Clone)]
struct KeyObject {
    is_key: bool,
    heights: Vec<usize>,
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let grids: Vec<Vec<Vec<char>>> = raw_input.trim().split("\n\n").map(|grid| grid.split("\n").map(|row| row.chars().collect()).collect()).collect();

    let width = grids[0][0].len();
    let height = grids[0].len() - 2;

    println!("Each grid has {width} columns of height {height}");

    let objects: Vec<KeyObject> = grids.iter().map(|grid| {
        let is_key = grid[0][0] == '.';
        let heights = (0..width).map(|c| {
            grid.iter().filter(|row| row[c] == '#').count() - 1
        }).collect();
        KeyObject { is_key, heights }
    }).collect();

    let keys: Vec<_> = objects.iter().filter(|o| o.is_key).collect();
    let locks: Vec<_> = objects.iter().filter(|o| !o.is_key).collect();

    println!("Found {} keys and {} locks", keys.len(), locks.len());

    let mut result = 0;
    for key in &keys {
        for lock in &locks {
            if (0..width).all(|c| key.heights[c] + lock.heights[c] <= height) {
                result += 1
            }
        }
    }
    println!("There are {result} key/lock combinations to try");
}
