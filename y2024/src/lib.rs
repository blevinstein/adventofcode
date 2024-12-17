
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

    pub fn manhattan_dist(&self) -> usize {
        self.x.abs() as usize + self.y.abs() as usize
    }
}

