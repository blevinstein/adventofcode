use std::env;
use std::fs;
use std::collections::HashSet;
use std::collections::VecDeque;

use y2024::Pos;

const DIRECTIONS: [Pos; 4] = [
    Pos { x: 1, y: 0 },
    Pos { x: -1, y: 0 },
    Pos { x: 0, y: 1 },
    Pos { x: 0, y: -1 },
];

fn shortest_dist(map: &HashSet<Pos>, start: &Pos, end: &Pos, size: isize) -> Option<usize> {
    let in_bounds = |p: &Pos| 0 <= p.x && p.x < size && 0 <= p.y && p.y < size;
    let mut queue: VecDeque<(Pos, usize)> = VecDeque::from([( *start, 0 )]);
    let mut visited: HashSet<Pos> = HashSet::new();
    while !queue.is_empty() {
        let (current_pos, current_cost) = queue.pop_front().unwrap();
        if current_pos == *end {
            return Some(current_cost)
        }
        if visited.contains(&current_pos) {
            continue
        }
        visited.insert(current_pos);

        for direction in DIRECTIONS {
            let new_pos = current_pos.add(&direction);
            let new_cost = current_cost + 1;
            if in_bounds(&new_pos) && !map.contains(&new_pos) && !visited.contains(&new_pos) {
                queue.push_back((new_pos, new_cost));
            }
        }
    }
    None
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    // Size of grid
    let size: isize = env::args().nth(2).and_then(|s| s.parse().ok()).unwrap_or(71);
    // Number of blocks to fall before solving part 1
    let blocks: usize = env::args().nth(3).and_then(|s| s.parse().ok()).unwrap_or(1024);

    let start = Pos { x: 0, y: 0 };
    let end = Pos { x: size - 1, y: size - 1 };
    let falling: Vec<Pos> = raw_input.trim().split("\n").map(|line| {
        let nums: Vec<isize> = line.split(",").map(|s| s.parse().unwrap()).collect();
        Pos { x: nums[0], y: nums[1] }
    }).collect();

    // Part 1
    {
        let corrupted: HashSet<Pos> = falling.iter().take(blocks).cloned().collect();
        let min_cost = shortest_dist(&corrupted, &start, &end, size).unwrap();
        println!("Shortest path is {min_cost}");
    }

    // Part 2
    {
        for count in 0..falling.len() {
            let corrupted: HashSet<Pos> = falling.iter().take(count).cloned().collect();
            if let None = shortest_dist(&corrupted, &start, &end, size) {
                let straw = falling[count - 1];
                println!("First blocking byte is {},{}", straw.x, straw.y);
                break;
            }
        }
    }
}
