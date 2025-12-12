
use std::env;
use std::fs;
use y2025::Pos;
use serde_json::{to_string,from_str};

#[derive(Debug)]
struct Tree {
  width: usize,
  height: usize,
  presents: Vec<usize>,
}

fn present_mask(raw: &Vec<Vec<bool>>) -> [usize; 3] {
  raw.iter()
      .map(|row| row.iter().enumerate()
          .map(|(i, value)| (if *value { 1 << i } else { 0 }))
          .sum::<usize>())
      .collect::<Vec<usize>>()
      .try_into()
      .unwrap()
}

fn tree_mask(tree: &Tree) -> Vec<usize> {
  (0..tree.height).map(|_y| 0).collect()
}

fn rotate(grid: &Vec<Vec<bool>>) -> Vec<Vec<bool>> {
  let height = grid.len();
  let width = grid[0].len();
  (0..height)
      .map(|y| (0..width)
          .map(|x| grid[x][height-y-1])
          .collect())
      .collect()
}

fn flip(grid: &Vec<Vec<bool>>) -> Vec<Vec<bool>> {
  let height = grid.len();
  let width = grid[0].len();
  (0..height)
      .map(|y| (0..width)
          .map(|x| grid[y][width-x-1])
          .collect())
      .collect()
}

fn present_fits(tree: &Tree, tree_mask: &Vec<usize>, offset: &Pos, present_mask: &[usize; 3]) -> bool {
  offset.x >= 0 && (offset.x as usize) < tree.width - 2
      && offset.y >= 0 && (offset.y as usize) < tree.height - 2
      && (0..3).all(|y| tree_mask[y + offset.y as usize] & (present_mask[y] << offset.x) == 0)
}

fn add_to_mask(tree_mask: &Vec<usize>, offset: &Pos, present_mask: &[usize; 3]) -> Vec<usize> {
  let mut result = tree_mask.clone();
  for y in 0..3 {
    result[y + offset.y as usize] |= present_mask[y] << offset.x;
  }
  result
}

fn all_offsets(tree: &Tree) -> Vec<Pos> {
  (0..(tree.width-2))
      .flat_map(|x| (0..(tree.height - 2))
          .map(|y| Pos { x: x as isize, y: y as isize })
          .collect::<Vec<Pos>>())
      .collect()
}

fn can_satisfy(tree: &Tree, present_masks: &Vec<Vec<[usize; 3]>>) -> bool {
  let tree_offsets = all_offsets(tree);
  can_satisfy_helper(tree, &tree_mask(tree), &tree_offsets, &tree.presents, present_masks, true)
}

fn can_satisfy_helper(
    tree: &Tree,
    tree_mask: &Vec<usize>,
    tree_offsets: &Vec<Pos>,
    remaining_presents: &Vec<usize>,
    present_masks: &Vec<Vec<[usize; 3]>>,
    top_level: bool) -> bool {
  if remaining_presents.iter().sum::<usize>() == 0 {
    true
  } else {
    let next_present = remaining_presents.iter().position(|i| *i > 0).unwrap();
    present_masks[next_present]
        .iter()
        .enumerate()
        .any(|(mask_i, present_mask)| tree_offsets
            .iter()
            .enumerate()
            .any(|(offset_i, tree_offset)| {
              if !present_fits(tree, tree_mask, tree_offset, present_mask) {
                return false
              }

              if top_level {
                println!("Checking mask {}/{} offset {}/{}",
                    mask_i,
                    present_masks[next_present].len(),
                    offset_i,
                    tree_offsets.len());
              }

              let new_tree_mask = add_to_mask(tree_mask, tree_offset, present_mask);
              let mut new_remaining_presents = remaining_presents.clone();
              new_remaining_presents[next_present] -= 1;
              can_satisfy_helper(
                  tree,
                  &new_tree_mask,
                  tree_offsets,
                  &new_remaining_presents,
                  present_masks,
                  false)
            }))
  }
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let (raw_presents, raw_trees) = raw_input.rsplit_once("\n\n").unwrap();

  let presents: Vec<Vec<Vec<bool>>> = raw_presents.trim().split("\n\n")
      .map(|raw_present| {
        let mut lines = raw_present.trim().split("\n");
        lines.next(); // Discard first line with index
        lines.map(|line| line.chars().map(|c| c == '#').collect())
            .collect()
      })
      .collect();

  let present_sizes : Vec<usize> = presents
      .iter()
      .map(|grid| grid.iter().map(|row| row.iter().filter(|cell| **cell).count()).sum())
      .collect();

  // NOTE: Each present can present as 8 different configurations, flipped and rotated
  let present_masks: Vec<Vec<[usize; 3]>> = presents.iter()
      .map(|grid| vec![
        present_mask(&grid),
        present_mask(&rotate(&grid)),
        present_mask(&rotate(&rotate(&grid))),
        present_mask(&rotate(&rotate(&rotate(&grid)))),
        present_mask(&flip(&grid)),
        present_mask(&rotate(&flip(&grid))),
        present_mask(&rotate(&rotate(&flip(&grid)))),
        present_mask(&rotate(&rotate(&rotate(&flip(&grid))))),
      ])
      .collect();

  let trees: Vec<Tree> = raw_trees
      .trim().split("\n")
      .map(|raw_tree| {
        let (dims, present_counts) = raw_tree.split_once(": ").unwrap();
        let (raw_width, raw_height) = dims.split_once("x").unwrap();
        let width = raw_width.parse::<usize>().unwrap();
        let height = raw_height.parse::<usize>().unwrap();
        let presents: Vec<usize> = present_counts.split_whitespace()
            .map(|raw_count| raw_count.parse::<usize>().unwrap())
            .collect();
        Tree { width, height, presents }
      })
      .collect();

  //println!("presents: {presents:?}");
  //println!("presents_masks: {present_masks:?}");
  //println!("presents_sizes: {present_sizes:?}");
  //println!("trees: {trees:?}");

  // Calculate the naive number of possible positions we have to consider
  /*
  let total_checks: usize =
      trees.iter().map(|tree| {
        tree.presents.iter().sum::<usize>() * tree.width * tree.height * 4
      })
      .sum();
  println!("Naive solution will require {total_checks} checks");
  */

  let mut result_data: Vec<bool> = if let Some(checkpoint_file) = env::args().nth(2) {
    if fs::exists(&checkpoint_file).unwrap() {
      from_str(&fs::read_to_string(checkpoint_file).expect("Failed to read checkpoint data"))
          .expect("Failed to parse JSON checkpoint data")
    } else {
      vec![]
    }
  } else {
    vec![]
  };
  //println!("Loaded checkpoint data: {result_data:?}");

  for i in result_data.len()..trees.len() {
    let tree = &trees[i];
    let empty_spaces =
        (tree.width * tree.height) as isize
        - tree.presents.iter().enumerate().map(|(i, count)| present_sizes[i] * count).sum::<usize>() as isize;

    let full_squares = (tree.width / 3) * (tree.height / 3);

    let result = if empty_spaces < 0 {
      false
    } else if full_squares > tree.presents.iter().sum() {
      true
    } else {
      can_satisfy(tree, &present_masks)
    };
    result_data.push(result);
    println!("Result for tree {i}: {result}");

    if let Some(checkpoint_file) = env::args().nth(2) {
      fs::write(checkpoint_file, to_string(&result_data).unwrap().as_bytes()).unwrap();
    }
  }

  println!("Number of satisfiable trees: {}", result_data.iter().filter(|result| **result).count());
}
