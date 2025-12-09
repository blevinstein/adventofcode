
use std::env;
use std::fs;
use std::cmp::min;
use std::cmp::max;
use std::collections::HashSet;
use std::collections::HashMap;

use y2025::Pos;

fn contains(point: &Pos, points_on_edges: &HashSet<Pos>, vertical_edges: &Vec<&Vec<Pos>>, cache: &mut HashMap<Pos, bool>) -> bool {
  // Check cache first
  if let Some(&result) = cache.get(point) {
    return result;
  }

  // First check if the point is exactly on an edge (O(1) lookup)
  let result = points_on_edges.contains(point)
  // Second, use a "raycasting" algorithm to check for interior points
  || vertical_edges.iter()
      .filter(|edge|
          // If the edge is vertical
          // and a line from (-infinity, point.y) to `point` crosses the edge
          edge[0].x < point.x
          && min(edge[0].y, edge[1].y) <= point.y
          && max(edge[0].y, edge[1].y) > point.y)
      // then we count this as an intersection.
      // If the number of intersections is odd, we are inside the polygon
      .count() % 2 == 1;

  // Store in cache
  cache.insert(*point, result);
  result
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input: Vec<Pos> = raw_input.trim().split("\n")
      .map(|line| {
        let mut num_iter = line.split(",");
        Pos {
          x: num_iter.next().unwrap().parse::<isize>().unwrap(),
          y: num_iter.next().unwrap().parse::<isize>().unwrap(),
        }
      })
      .collect();

  let size = input.len();

  let mut max_area = 0;
  for i in 0..size {
    for j in 0..size {
      let area = (input[i].x - input[j].x + 1) * (input[i].y - input[j].y + 1);
      if area > max_area {
        max_area = area;
      }
    }
  }

  println!("Max area is {max_area}");

  let edges: Vec<Vec<Pos>> = input.windows(2)
      .map(|edge| edge.to_vec())
      .chain(std::iter::once(vec![input[input.len() - 1], input[0]]))
      .collect();

  // Ensure that the edges are horizontal or vertical
  for edge in edges.iter() {
    if edge[0].x != edge[1].x && edge[0].y != edge[1].y {
      panic!("Some edges are neither horizontal nor vertical");
    }
  }

  // Ensure that the edges never cross
  for i in 0..size {
    for j in 0..size {
      // i is vertical, j is horizontal
      if edges[i][0].x == edges[i][1].x
          && edges[j][0].y == edges[j][1].y
          // and i spans the y coord of j
          && min(edges[i][0].y, edges[i][1].y) < edges[j][0].y
          && max(edges[i][0].y, edges[i][1].y) > edges[j][0].y
          // and j spans the x coord of i
          && min(edges[j][0].x, edges[j][1].x) < edges[i][0].x
          && max(edges[j][0].x, edges[j][1].x) > edges[i][0].x {
        panic!("The loop crosses itself");
      }
    }
  }

  let critical_xs: HashSet<isize> = input.iter().map(|p| p.x).collect();
  let critical_ys: HashSet<isize> = input.iter().map(|p| p.y).collect();

  // Pre-compute all points (at critical coordinates) that lie on edges
  let mut points_on_edges: HashSet<Pos> = HashSet::new();
  for edge in edges.iter() {
    if edge[0].x == edge[1].x {
      // Vertical edge
      let x = edge[0].x;
      let min_y = min(edge[0].y, edge[1].y);
      let max_y = max(edge[0].y, edge[1].y);
      for &y in critical_ys.iter() {
        if y >= min_y && y <= max_y {
          points_on_edges.insert(Pos { x, y });
        }
      }
    } else {
      // Horizontal edge
      let y = edge[0].y;
      let min_x = min(edge[0].x, edge[1].x);
      let max_x = max(edge[0].x, edge[1].x);
      for &x in critical_xs.iter() {
        if x >= min_x && x <= max_x {
          points_on_edges.insert(Pos { x, y });
        }
      }
    }
  }

  // Pre-filter vertical edges for raycasting performance
  let vertical_edges: Vec<&Vec<Pos>> = edges.iter()
      .filter(|edge| edge[0].x == edge[1].x)
      .collect();

  // Cache for contains() results
  let mut contains_cache: HashMap<Pos, bool> = HashMap::new();

  max_area = 0;
  let mut coords: Vec<Pos> = vec![];
  for i in 0..size {
    println!("Progress {i}/{size}...");
    'outer: for j in 0..size {
      // Ensure that all edge points are within the loop; this will ensure that all interior points
      // are as well
      let min_corner = Pos { x: min(input[i].x, input[j].x), y: min(input[i].y, input[j].y) };
      let max_corner = Pos { x: max(input[i].x, input[j].x), y: max(input[i].y, input[j].y) };
      for x in min_corner.x..max_corner.x {
        if !critical_xs.contains(&x) {
          continue;
        }
        if !contains(&Pos { x: x, y: min_corner.y }, &points_on_edges, &vertical_edges, &mut contains_cache)
            || !contains(&Pos { x: x, y: max_corner.y }, &points_on_edges, &vertical_edges, &mut contains_cache) {
          continue 'outer;
        }
      }
      for y in min_corner.y..max_corner.y {
        if !critical_ys.contains(&y) {
          continue;
        }
        if !contains(&Pos { x: min_corner.x, y: y }, &points_on_edges, &vertical_edges, &mut contains_cache)
            || !contains(&Pos { x: max_corner.x, y: y }, &points_on_edges, &vertical_edges, &mut contains_cache) {
          continue 'outer;
        }
      }

      let area = (input[i].x - input[j].x + 1) * (input[i].y - input[j].y + 1);
      if area > max_area {
        max_area = area;
        coords = vec![input[i], input[j]];
      }
    }
  }

  println!("Max red/green area is {max_area} at coords {coords:?}");
}
