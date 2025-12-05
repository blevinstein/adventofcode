
pub fn grid_at_mut<'a, T>(grid: &'a mut Vec<Vec<T>>, pos: &Pos) -> &'a mut T {
    grid.get_mut(pos.y as usize)
        .expect("y out of bounds")
        .get_mut(pos.x as usize)
        .expect("x out of bounds")
}

pub fn grid_at<'a, T>(grid: &'a Vec<Vec<T>>, pos: &Pos) -> &'a T {
    &grid[pos.y as usize][pos.x as usize]
}

pub fn grid_find<T: Eq>(grid: &Vec<Vec<T>>, elem: &T) -> Pos {
    let y = grid.iter().position(|row| row.contains(elem)).unwrap();
    let row = &grid[y];
    let x = row.iter().position(|e| *e == *elem).unwrap();
    Pos { x: x as isize, y: y as isize }
}

pub fn grid_coords(width: usize, height: usize) -> Vec<Pos> {
  (0..height)
      .flat_map(|y| (0..width).map(|x| Pos { x: x as isize, y: y as isize }).collect::<Vec<Pos>>())
      .collect()
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
pub struct Pos {
    pub x: isize,
    pub y: isize,
}

impl Pos {
    pub fn sub(&self, other: &Pos) -> Pos {
        Pos {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }

    pub fn add(&self, other: &Pos) -> Pos {
        Pos {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }

    pub fn mul(&self, scalar: isize) -> Pos {
        Pos {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn dot(&self, other: &Pos) -> isize {
        self.x * other.x + self.y * other.y
    }

    pub fn manhattan_dist(&self) -> isize {
        self.x.abs() + self.y.abs()
    }
}

