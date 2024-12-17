use std::env;
use std::fs;
use std::collections::HashSet;

#[derive(Copy,Clone,Debug,Hash,Eq,PartialEq)]
struct Pos {
    x: isize,
    y: isize,
}

fn trail_ends(grid: &Vec<Vec<usize>>, start: &Pos) -> Vec<Pos> {
    let in_bounds = |p: &Pos| 0 <= p.x && p.x < grid[0].len() as isize && 0 <= p.y && p.y < grid.len() as isize;

    if in_bounds(&start) && grid[start.y as usize][start.x as usize] == 9 {
        return vec![*start];
    }

    let neighbors = vec![
        Pos { x: start.x + 1, y: start.y },
        Pos { x: start.x - 1, y: start.y },
        Pos { x: start.x, y: start.y + 1 },
        Pos { x: start.x, y: start.y - 1 },
    ];
    let mut result: HashSet<Pos> = HashSet::new();
    for neighbor in neighbors {
        if in_bounds(&neighbor)
            && grid[neighbor.y as usize][neighbor.x as usize] == grid[start.y as usize][start.x as usize] + 1 {
            result.extend(trail_ends(&grid, &neighbor));
        }
    }
    result.into_iter().collect()
}

fn unique_trails(grid: &Vec<Vec<usize>>, start: &Pos) -> usize {
    let in_bounds = |p: &Pos| 0 <= p.x && p.x < grid[0].len() as isize && 0 <= p.y && p.y < grid.len() as isize;

    if in_bounds(&start) && grid[start.y as usize][start.x as usize] == 9 {
        return 1;
    }

    let neighbors = vec![
        Pos { x: start.x + 1, y: start.y },
        Pos { x: start.x - 1, y: start.y },
        Pos { x: start.x, y: start.y + 1 },
        Pos { x: start.x, y: start.y - 1 },
    ];
    let mut result = 0;
    for neighbor in neighbors {
        if in_bounds(&neighbor)
            && grid[neighbor.y as usize][neighbor.x as usize] == grid[start.y as usize][start.x as usize] + 1 {
            result += unique_trails(&grid, &neighbor);
        }
    }
    result
}


fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let grid: Vec<Vec<usize>> = raw_input
        .trim()
        .split("\n")
        .map(|line| {
            line.chars()
                .map(|c| c.to_string().parse().expect("Parse failure"))
                .collect()
        })
        .collect();

    // Part 1
    let mut score = 0;
    for (y, row) in grid.iter().enumerate() {
        for (x, height) in row.iter().enumerate() {
            if *height == 0 {
                score += trail_ends(&grid, &Pos { x: x as isize, y: y as isize }).len();
            }
        }
    }
    println!("Total score is {score}");

    // Part 2
    let mut rating = 0;
    for (y, row) in grid.iter().enumerate() {
        for (x, height) in row.iter().enumerate() {
            if *height == 0 {
                rating += unique_trails(&grid, &Pos { x: x as isize, y: y as isize });
            }
        }
    }
    println!("Total rating is {rating}");
}
