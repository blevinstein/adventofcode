use std::collections::HashMap;
use std::env;
use std::fs;
use std::hash::Hash;

use y2024::grid_at;
use y2024::grid_find;
use y2024::Pos;

const DIRECTIONS: [Pos; 4] = [
    Pos { x: 1, y: 0 },
    Pos { x: -1, y: 0 },
    Pos { x: 0, y: 1 },
    Pos { x: 0, y: -1 },
];

const CHEAT_DIRECTIONS: [Pos; 8] = [
    Pos { x: 2, y: 0 },
    Pos { x: -2, y: 0 },
    Pos { x: 0, y: 2 },
    Pos { x: 0, y: -2 },
    Pos { x: 1, y: 1 },
    Pos { x: -1, y: 1 },
    Pos { x: 1, y: -1 },
    Pos { x: -1, y: -1 },
];

fn run_race(walls: &Vec<Vec<bool>>, start_pos: &Pos, end_pos: &Pos) -> Vec<Pos> {
    let mut path = Vec::from([*start_pos]);
    let mut current_pos = *start_pos;
    let mut last_pos: Option<Pos> = None;

    while current_pos != *end_pos {
        let next_neighbors: Vec<Pos> = DIRECTIONS
            .iter()
            .map(|&dir| current_pos.add(&dir))
            .filter(|p| !*grid_at(walls, p) && last_pos != Some(*p))
            .collect();
        if next_neighbors.len() > 1 {
            panic!("Path forked unexpectedly");
        }
        last_pos = Some(current_pos);
        current_pos = next_neighbors[0];
        path.push(current_pos);
    }

    path
}

fn map_by_index<T: Clone + Hash + Eq>(v: &Vec<T>) -> HashMap<T, usize> {
    let mut result: HashMap<T, usize> = HashMap::new();

    for (i, item) in v.iter().enumerate() {
        result.insert(item.clone(), i);
    }

    result
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let raw_grid: Vec<Vec<char>> = raw_input
        .trim()
        .split("\n")
        .map(|line| line.chars().collect())
        .collect();

    let walls: Vec<Vec<bool>> = raw_grid
        .iter()
        .map(|row| row.iter().map(|&c| c == '#').collect())
        .collect();

    let height = raw_grid.len() as isize;
    let width = raw_grid[0].len() as isize;

    let start_pos = grid_find(&raw_grid, &'S');
    let end_pos = grid_find(&raw_grid, &'E');

    // Part 1
    let original_path: Vec<Pos> = run_race(&walls, &start_pos, &end_pos);
    let index_map = map_by_index(&original_path);
    let mut big_cheats = 0;
    for start_cheat in original_path {
        let start_index = *index_map
            .get(&start_cheat)
            .expect("start_cheat not on path");
        for cheat_dir in CHEAT_DIRECTIONS {
            let end_cheat = start_cheat.add(&cheat_dir);
            if end_cheat.x < 0
                || end_cheat.y < 0
                || end_cheat.x >= width
                || end_cheat.y >= height
                || *grid_at(&walls, &end_cheat)
            {
                continue;
            }
            let end_index = *index_map.get(&end_cheat).expect("end_cheat not on path");
            /*
            if end_index > start_index + 2 {
                dbg!(end_index - start_index - 2);
            }
            */
            if end_index >= start_index + 102 {
                big_cheats += 1;
            }
        }
    }
    println!("Found {big_cheats} big 2-picosecond cheats");

    // Part 2
    let original_path: Vec<Pos> = run_race(&walls, &start_pos, &end_pos);
    let index_map = map_by_index(&original_path);
    let mut debug_map: HashMap<isize, usize> = HashMap::new();
    let mut big_cheats = 0;
    for start_cheat in original_path {
        let start_index = *index_map
            .get(&start_cheat)
            .expect("start_cheat not on path");
        for cheat_x in -20..=20 {
            for cheat_y in -20..=20 {
                let cheat_dir = Pos {
                    x: cheat_x,
                    y: cheat_y,
                };
                if cheat_dir.manhattan_dist() > 20 {
                    continue;
                }
                let end_cheat = start_cheat.add(&cheat_dir);
                if end_cheat.x < 0
                    || end_cheat.y < 0
                    || end_cheat.x >= width
                    || end_cheat.y >= height
                    || *grid_at(&walls, &end_cheat)
                {
                    continue;
                }
                let end_index = *index_map.get(&end_cheat).expect("end_cheat not on path");
                let savings =
                    end_index as isize - start_index as isize - cheat_dir.manhattan_dist();
                if savings >= 50 {
                    *debug_map.entry(savings).or_insert(0) += 1;
                }
                if savings >= 100 {
                    big_cheats += 1;
                }
            }
        }
    }
    //dbg!(debug_map);
    println!("Found {big_cheats} big 20-picosecond cheats");
}
