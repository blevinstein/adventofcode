use std::env;
use std::fs;

fn is_possible(t: &[u32; 3]) -> bool {
    if t[0] + t[1] <= t[2] { return false }
    if t[1] + t[2] <= t[0] { return false }
    if t[0] + t[2] <= t[1] { return false }
    true
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
        .expect("Failed to read input");

    // Part 1
    {
        let triangles: Vec<[u32; 3]> = raw_input.trim().split("\n")
            .map(|line| line.trim().split_whitespace()
                .map(|s| s.parse::<u32>().unwrap())
                .collect::<Vec<u32>>()
                .try_into()
                .unwrap())
            .collect();
        let possible_triangles = triangles.iter().filter(|tri| is_possible(tri)).count();
        println!("{possible_triangles:?}");
    }

    // Part 2
    {
        let mut triangles: Vec<[u32; 3]> = Vec::new();
        let lines: Vec<&str> = raw_input.trim().split("\n").collect();
        let mut iter = lines.iter();
        loop {
            let next_lines: Vec<Vec<u32>> = iter.by_ref().take(3)
                .map(|line| line.trim().split_whitespace()
                    .map(|s| s.parse::<u32>().unwrap())
                    .collect())
                .collect();
            if next_lines.len() < 3 { break }
            for i in 0..3 {
                triangles.push([next_lines[0][i], next_lines[1][i], next_lines[2][i]]);
            }
        }
        let possible_triangles = triangles.iter().filter(|tri| is_possible(tri)).count();
        println!("{possible_triangles:?}");
    }
}
