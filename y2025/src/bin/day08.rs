
use std::env;
use std::fs;

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
pub struct Point {
    pub x: isize,
    pub y: isize,
    pub z: isize,
}

impl Point {
  pub fn sub(&self, other: &Point) -> Point {
    Point {
      x: self.x - other.x,
      y: self.y - other.y,
      z: self.z - other.z,
    }
  }

  pub fn norm(&self) -> isize {
    self.x * self.x + self.y * self.y + self.z * self.z
  }

  pub fn dist(&self, other: &Point) -> isize {
    self.sub(other).norm()
  }
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let points: Vec<Point> = raw_input.trim().split("\n")
      .map(|line| {
        let mut num_iter = line.split(",");
        Point {
          x: num_iter.next().unwrap().parse::<isize>().unwrap(),
          y: num_iter.next().unwrap().parse::<isize>().unwrap(),
          z: num_iter.next().unwrap().parse::<isize>().unwrap(),
        }
      })
      .collect();

  // Default to 1000 steps, but specify 10 for test input
  let steps = env::args().nth(2)
      .or(Some("1000".to_string()))
      .unwrap().parse::<usize>().unwrap();

  let size = points.len();

  let mut closest_pairs: Vec<(usize, usize, isize)> = (0..size)
      .flat_map(|i| (0..size)
          .flat_map(|j| if i <= j { None } else { Some((i, j, points[i].dist(&points[j]))) })
          .collect::<Vec<(usize, usize, isize)>>())
      .collect();
  closest_pairs.sort_by(|a, b| a.2.cmp(&b.2));

  //println!("closest_pairs are {closest_pairs:?}");

  let mut circuits: Vec<Vec<usize>> = (0..points.len()).map(|i| vec![i]).collect();

  for (i, j, _) in &closest_pairs[..steps] {
    let circuit_i = circuits.iter().position(|circuit| circuit.iter().find(|el| *el == i).is_some()).unwrap();
    let circuit_j = circuits.iter().position(|circuit| circuit.iter().find(|el| *el == j).is_some()).unwrap();
    if circuit_i != circuit_j {
      let circuit_j_clone = circuits[circuit_j].clone();
      circuits[circuit_i].extend_from_slice(&circuit_j_clone);
      circuits.remove(circuit_j);
    }
  }
  circuits.sort_by(|a, b| b.len().cmp(&a.len()));

  let product: usize = circuits[..3].iter().map(|circuit| circuit.len()).product();
  println!("Product of top three circuit sizes after {steps} connections is {product}");

  let mut new_circuits: Vec<Vec<usize>> = (0..points.len()).map(|i| vec![i]).collect();

  for (i, j, _) in closest_pairs {
    let circuit_i = new_circuits.iter().position(|circuit| circuit.iter().find(|el| **el == i).is_some()).unwrap();
    let circuit_j = new_circuits.iter().position(|circuit| circuit.iter().find(|el| **el == j).is_some()).unwrap();
    if circuit_i != circuit_j {
      let circuit_j_clone = new_circuits[circuit_j].clone();
      new_circuits[circuit_i].extend_from_slice(&circuit_j_clone);
      new_circuits.remove(circuit_j);

      if new_circuits.len() == 1 {
        let x_product = points[i].x * points[j].x;
        println!("Product of last two x coords joined is {x_product}");
        break;
      }
    }
  }
}
