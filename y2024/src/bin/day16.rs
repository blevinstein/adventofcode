use std::collections::HashMap;
use std::collections::HashSet;
use std::collections::VecDeque;
use std::env;
use std::fs;

use y2024::*;

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
enum Dir {
    North,
    East,
    South,
    West,
}

impl Dir {
    fn unit(&self) -> Pos {
        match self {
            Dir::North => Pos { x: 0, y: -1 },
            Dir::South => Pos { x: 0, y: 1 },
            Dir::East => Pos { x: 1, y: 0 },
            Dir::West => Pos { x: -1, y: 0 },
        }
    }

    fn left(&self) -> Dir {
        match self {
            Dir::North => Dir::West,
            Dir::West => Dir::South,
            Dir::South => Dir::East,
            Dir::East => Dir::North,
        }
    }

    fn right(&self) -> Dir {
        match self {
            Dir::North => Dir::East,
            Dir::East => Dir::South,
            Dir::South => Dir::West,
            Dir::West => Dir::North,
        }
    }
}

/*
fn cheapest_path(grid: &Vec<Vec<bool>>, start_pos: &Pos, end_pos: &Pos) -> usize {
    let mut frontier: Vec<(Pos, Dir, usize)> = Vec::from([(*start_pos, Dir::East, 0)]);
    let mut result: Option<usize> = None;
    let mut visited_cost: HashMap<(Pos, Dir), usize> = HashMap::new();

    while !frontier.is_empty() {
        let (current_pos, current_dir, current_cost) = frontier.pop().unwrap();

        // Visited check, ensuring that a lower-cost path is re-explored
        if let Some(prev_cost) = visited_cost.get(&(current_pos, current_dir)) {
            if *prev_cost <= current_cost {
                continue;
            }
        }
        visited_cost.insert((current_pos, current_dir), current_cost);

        // Prune sub-optimal branches
        if let Some(prev_cost) = result {
            if prev_cost < current_cost {
                continue;
            }
        }

        // Goal check
        if current_pos == *end_pos {
            result = Some(current_cost);
            continue;
        }

        // Continue search
        for next_state in [
            (
                current_pos.add(&current_dir.unit()),
                current_dir,
                current_cost + 1,
            ),
            (current_pos, current_dir.left(), current_cost + 1000),
            (current_pos, current_dir.right(), current_cost + 1000),
        ]
        .iter()
        .filter(|(p, _d, _c)| !*grid_at(grid, p))
        {
            frontier.push(next_state.clone());
        }
    }

    result.expect("No path found")
}
*/

fn cheapest_paths(grid: &Vec<Vec<bool>>, start_pos: &Pos, end_pos: &Pos) -> (Vec<Vec<Pos>>, usize) {
    let mut frontier: VecDeque<(Pos, Dir, usize, Vec<Pos>)> = VecDeque::from([(*start_pos, Dir::East, 0, vec![*start_pos])]);
    let mut paths: Vec<Vec<Pos>> = Vec::new();
    let mut min_cost: Option<usize> = None;
    let mut visited_cost: HashMap<(Pos, Dir), usize> = HashMap::new();

    let mut step = 0;
    while !frontier.is_empty() {
        let (current_pos, current_dir, current_cost, current_path) = frontier.pop_front().unwrap();

        if (step+1) % 100000 == 0 {
            //println!("Step {} frontier size {} min cost {:?} current cost {}", step+1, frontier.len(), min_cost, current_cost);
        }
        step += 1;

        // Visited check, ensuring that a lower-cost path is re-explored
        if let Some(_) = visited_cost.get(&(current_pos, current_dir)).filter(|&prev_cost| *prev_cost < current_cost) {
            continue;
        }
        visited_cost.insert((current_pos, current_dir), current_cost);

        // Prune sub-optimal branches
        if let Some(_) = min_cost.filter(|&prev_cost| prev_cost < current_cost) {
            continue;
        }

        // Goal check
        if current_pos == *end_pos {
            if let Some(_) = min_cost.filter(|&c| c > current_cost) {
                paths.clear();
            }
            paths.push(current_path);
            min_cost = Some(current_cost);
            continue;
        }

        // Continue search
        let forward = current_pos.add(&current_dir.unit());
        for next_state in [
            (
                forward,
                current_dir,
                current_cost + 1,
                [current_path.clone(), vec![forward]].concat(),
            ),
            (current_pos, current_dir.left(), current_cost + 1000, current_path.clone()),
            (current_pos, current_dir.right(), current_cost + 1000, current_path.clone()),
        ]
        .iter()
        .filter(|(p, _d, _c, _path)| !*grid_at(grid, p))
        {
            frontier.push_back(next_state.clone());
        }
    }

    (paths, min_cost.expect("No path found"))
}


fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let raw_grid: Vec<Vec<char>> = raw_input
        .trim()
        .split("\n")
        .map(|line| line.chars().collect())
        .collect();
    let grid: Vec<Vec<bool>> = raw_grid
        .iter()
        .map(|row| row.iter().map(|c| *c == '#').collect())
        .collect();
    let start_pos = grid_find(&raw_grid, &'S');
    let end_pos = grid_find(&raw_grid, &'E');

    // Part 1
    /*
    let cost = cheapest_path(&grid, &start_pos, &end_pos);
    println!("Cheapest path is {cost}");
    */

    let (paths, cost) = cheapest_paths(&grid, &start_pos, &end_pos);
    // Part 1
    println!("Cheapest path is {cost}");
    let squares_on_path: HashSet<Pos> = paths.iter().flat_map(|path| path.iter().cloned()).collect();
    println!("Squares on path is {}", squares_on_path.len());
}
