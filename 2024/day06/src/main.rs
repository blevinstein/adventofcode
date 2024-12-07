use std::collections::HashSet;
use std::env;
use std::fs;

#[derive(Eq, PartialEq, Debug, Clone, Copy)]
enum Space {
    Empty,
    Guard,
    Obstacle,
}

impl Space {
    fn parse(c: char) -> Space {
        match c {
            '.' => Space::Empty,
            '#' => Space::Obstacle,
            '^' => Space::Guard,
            _ => panic!("Unexpected input ${c}"),
        }
    }
}

#[derive(Eq, PartialEq, Debug, Hash, Clone, Copy)]
enum Dir {
    North,
    East,
    South,
    West,
}

impl Dir {
    fn turn_right(&self) -> Dir {
        match self {
            Dir::North => Dir::East,
            Dir::East => Dir::South,
            Dir::South => Dir::West,
            Dir::West => Dir::North,
        }
    }
}

type Pos = (isize, isize);

// TODO: Figure out how to do this with traits?
fn move_dir(p: &Pos, d: &Dir) -> Pos {
    match d {
        Dir::North => (p.0, p.1 - 1),
        Dir::East => (p.0 + 1, p.1),
        Dir::South => (p.0, p.1 + 1),
        Dir::West => (p.0 - 1, p.1),
    }
}

fn part_one(grid: &Vec<Vec<Space>>) -> Vec<Pos> {
    let width = grid[0].len() as isize;
    let height = grid.len() as isize;

    let is_guard = |el: &Space| *el == Space::Guard;
    let mut guard_position: Pos = (
        grid.iter()
            .find(|row| row.iter().any(is_guard))
            .expect("Missing guard")
            .iter()
            .position(is_guard)
            .expect("Missing guard") as isize,
        grid.iter()
            .position(|row| row.iter().any(is_guard))
            .expect("Missing guard") as isize,
    );
    //println!("Guard starts at {guard_position:?}");

    let mut guard_dir = Dir::North;
    let mut visited: HashSet<Pos> = HashSet::new();
    visited.insert(guard_position);
    loop {
        let front = move_dir(&guard_position, &guard_dir);
        if front.0 < 0 || front.0 >= width || front.1 < 0 || front.1 >= height {
            break;
        }
        match grid[front.1 as usize][front.0 as usize] {
            Space::Obstacle => {
                guard_dir = guard_dir.turn_right();
            }
            _ => {
                guard_position = front;
                visited.insert(guard_position);
            }
        }
    }
    //println!("Final guard position is {guard_position:?}");
    return visited.into_iter().collect();
}

fn part_two(grid: &Vec<Vec<Space>>, visited_positions: &Vec<Pos>) {
    let is_guard = |el: &Space| *el == Space::Guard;
    let start_position: Pos = (
        grid.iter()
            .find(|row| row.iter().any(is_guard))
            .expect("Missing guard")
            .iter()
            .position(is_guard)
            .expect("Missing guard") as isize,
        grid.iter()
            .position(|row| row.iter().any(is_guard))
            .expect("Missing guard") as isize,
    );

    let mut options = 0;
    for p in visited_positions {
        if would_loop(&grid, &p, &start_position) {
            options += 1
        }
    }
    println!("We have {options} options for looping");
}

fn would_loop(grid: &Vec<Vec<Space>>, new_obstacle: &Pos, start_position: &Pos) -> bool {
    let width = grid[0].len() as isize;
    let height = grid.len() as isize;

    let mut guard_position: Pos = *start_position;

    let mut guard_dir = Dir::North;
    let mut visited: HashSet<(Pos, Dir)> = HashSet::new();

    loop {
        let front = move_dir(&guard_position, &guard_dir);
        if front.0 < 0 || front.0 >= width || front.1 < 0 || front.1 >= height {
            return false;
        } else if front == *new_obstacle
            || grid[front.1 as usize][front.0 as usize] == Space::Obstacle
        {
            guard_dir = guard_dir.turn_right();
        } else {
            guard_position = front;
            if visited.contains(&(guard_position, guard_dir)) {
                return true;
            } else {
                visited.insert((guard_position, guard_dir));
            }
        }
    }
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let grid: Vec<Vec<Space>> = raw_input
        .trim()
        .split("\n")
        .map(|line| line.chars().map(Space::parse).collect())
        .collect();

    let visited_positions = part_one(&grid);
    println!("Position count is {}", visited_positions.len());
    part_two(&grid, &visited_positions);
}
