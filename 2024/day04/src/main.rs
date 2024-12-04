use std::env;
use std::fs;

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    let grid: Vec<Vec<char>> = raw_input
        .trim()
        .split("\n")
        .map(|line| line.chars().collect())
        .collect();
    let side = grid.len();

    // Part 1
    {
        let word = ['X', 'M', 'A', 'S'];
        let mut count = 0;
        for x in 0..side {
            for y in 0..side {
                for dx in -1..=1 as isize {
                    'check: for dy in -1..=1 as isize {
                        if dx == 0 && dy == 0 {
                            continue;
                        }
                        // Check for XMAS
                        for i in 0..4 as usize {
                            let ix = x as isize + dx * i as isize;
                            let iy = y as isize + dy * i as isize;
                            if !(0 <= ix
                                && ix < side as isize
                                && 0 <= iy
                                && iy < side as isize
                                && grid[iy as usize][ix as usize] == word[i])
                            {
                                continue 'check;
                            }
                        }
                        count += 1;
                    }
                }
            }
        }
        println!("{count}");
    }

    // Part 2
    {
        let word = ['M', 'A', 'S'];
        let mut count = 0;
        for x in 0..side {
            for y in 0..side {
                for dx in (-1..=1 as isize).step_by(2) {
                    'check: for dy in (-1..=1 as isize).step_by(2) {
                        // Check the first MAS
                        for i in 0..3 as usize {
                            let ix = x as isize + dx * (i as isize - 1);
                            let iy = y as isize + dy * (i as isize - 1);
                            if !(0 <= ix
                                    && ix < side as isize
                                    && 0 <= iy
                                    && iy < side as isize
                                    && grid[iy as usize][ix as usize] == word[i])
                            {
                                //println!("[{x},{y}] => [{dx},{dy}] fail at 1.{i}");
                                continue 'check;
                            }
                        }
                        // Check the second MAS
                        for i in (0..3 as usize).step_by(2) {
                            let ix = x as isize + dy * (i as isize - 1);
                            let iy = y as isize - dx * (i as isize - 1);
                            if !(0 <= ix
                                    && ix < side as isize
                                    && 0 <= iy
                                    && iy < side as isize
                                    && grid[iy as usize][ix as usize] == word[i])
                            {
                                //println!("[{x},{y}] => [{dx},{dy}] fail at 2.{i}");
                                continue 'check;
                            }
                        }
                        //println!("[{x},{y}] => [{dx},{dy}]");
                        count += 1;
                    }
                }
            }
        }
        println!("{count}");
    }
}
