
use std::env;
use std::fs;

use y2025::*;

fn neighbors(p: &Pos) -> Vec<Pos> {
  vec![
      Pos{ x: p.x + 1, y: p.y },
      Pos{ x: p.x - 1, y: p.y },
      Pos{ x: p.x, y: p.y + 1 },
      Pos{ x: p.x, y: p.y - 1 },
      Pos{ x: p.x + 1, y: p.y + 1 },
      Pos{ x: p.x + 1, y: p.y - 1 },
      Pos{ x: p.x - 1, y: p.y + 1 },
      Pos{ x: p.x - 1, y: p.y - 1 },
  ]
}

fn accessible_rolls(input: &Vec<Vec<bool>>) -> Vec<Pos> {
  let width = input.iter().nth(0).unwrap().len();
  let height = input.len();

  grid_coords(width, height)
      .into_iter()
      .filter(|pos|
          // There is a roll at `pos`
          *grid_at(input, &pos)
          // And fewer than 4 neighboring rolls
          && neighbors(&pos).iter()
              .filter(|neighbor|
                  // Bounds check
                  0 <= neighbor.x && neighbor.x < width as isize
                  && 0 <= neighbor.y && neighbor.y < height as isize
                  // Grid check
                  && *grid_at(input, &neighbor)).count() < 4)
      .collect()
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let mut input: Vec<Vec<bool>> = raw_input.trim().split("\n")
      .map(|line| line.chars().map(|c| c == '@').collect())
      .collect();

  let accessible_count = accessible_rolls(&input).len();

  println!("{accessible_count} are accessible initially");

  let mut removed_rolls = 0;
  loop {
    let removable_rolls = accessible_rolls(&input);
    if removable_rolls.len() == 0 {
      break;
    } else {
      //println!("Removing {} rolls", removable_rolls.len());
    }
    for removable_roll in removable_rolls {
      *grid_at_mut(&mut input, &removable_roll) = false;
      removed_rolls += 1;
    }
  }

  println!("{removed_rolls} were removed");
}
