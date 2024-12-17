use std::env;
use std::fs;

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
enum Space {
    Empty,
    Block,
    Wall,
    Robot,
    LeftBlock,
    RightBlock,
}

impl Space {
    fn parse(c: char) -> Space {
        match c {
            '#' => Space::Wall,
            'O' => Space::Block,
            '@' => Space::Robot,
            '.' => Space::Empty,
            _ => panic!("Unexpected character"),
        }
    }

    fn to_char(&self) -> char {
        match self {
            Space::Wall => '#',
            Space::Block => 'O',
            Space::Robot => '@',
            Space::Empty => '.',
            Space::LeftBlock => '[',
            Space::RightBlock => ']',
        }
    }
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
enum Dir {
    Up,
    Right,
    Down,
    Left,
}

impl Dir {
    fn parse(c: char) -> Dir {
        match c {
            '^' => Dir::Up,
            '>' => Dir::Right,
            'v' => Dir::Down,
            '<' => Dir::Left,
            _ => panic!("Unexpected character"),
        }
    }

    fn unit(&self) -> Pos {
        match self {
            Dir::Up => Pos { x: 0, y: -1 },
            Dir::Down => Pos { x: 0, y: 1 },
            Dir::Right => Pos { x: 1, y: 0 },
            Dir::Left => Pos { x: -1, y: 0 },
        }
    }
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone)]
struct Pos {
    x: isize,
    y: isize,
}

impl Pos {
    fn sub(&self, other: &Pos) -> Pos {
        Pos {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }

    fn add(&self, other: &Pos) -> Pos {
        Pos {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }

    fn mul(&self, scalar: isize) -> Pos {
        Pos {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    fn dot(&self, other: &Pos) -> isize {
        self.x * other.x + self.y * other.y
    }
}

fn grid_at_mut<'a, T>(grid: &'a mut Vec<Vec<T>>, pos: &Pos) -> &'a mut T {
    grid.get_mut(pos.y as usize)
        .expect("y out of bounds")
        .get_mut(pos.x as usize)
        .expect("x out of bounds")
}

fn grid_at<T: Copy>(grid: &Vec<Vec<T>>, pos: &Pos) -> T {
    grid[pos.y as usize][pos.x as usize]
}

fn move_robot(grid: &Vec<Vec<Space>>, moves: &Vec<Dir>) -> Vec<Vec<Space>> {
    let mut new_grid: Vec<Vec<Space>> = grid.clone();

    let mut robot_pos = Pos {
        x: new_grid
            .iter()
            .find(|row| row.contains(&Space::Robot))
            .unwrap()
            .iter()
            .position(|cell| *cell == Space::Robot)
            .unwrap() as isize,
        y: new_grid
            .iter()
            .position(|row| row.contains(&Space::Robot))
            .unwrap() as isize,
    };

    for dir in moves {
        let new_robot_pos = robot_pos.add(&dir.unit());
        let mut target_pos = new_robot_pos;
        while grid_at(&new_grid, &target_pos) == Space::Block {
            target_pos = target_pos.add(&dir.unit());
        }
        match grid_at(&new_grid, &target_pos) {
            Space::Wall => (),
            Space::Empty => {
                // Move the robot
                *grid_at_mut(&mut new_grid, &new_robot_pos) = Space::Robot;
                *grid_at_mut(&mut new_grid, &robot_pos) = Space::Empty;
                robot_pos = new_robot_pos;
                if new_robot_pos != target_pos {
                    // Move boxes
                    *grid_at_mut(&mut new_grid, &target_pos) = Space::Block;
                }
            }
            _ => panic!("Unexpected condition"),
        }
    }

    new_grid
}

fn move_robot2(grid: &Vec<Vec<Space>>, moves: &Vec<Dir>) -> Vec<Vec<Space>> {
    let mut new_grid: Vec<Vec<Space>> = grid.clone();

    let mut robot_pos = Pos {
        x: new_grid
            .iter()
            .find(|row| row.contains(&Space::Robot))
            .unwrap()
            .iter()
            .position(|cell| *cell == Space::Robot)
            .unwrap() as isize,
        y: new_grid
            .iter()
            .position(|row| row.contains(&Space::Robot))
            .unwrap() as isize,
    };

    println!("Robot starts at {robot_pos:?}");

    'cannot_move: for dir in moves {
        //print_grid(&new_grid);
        //println!("Try move {dir:?}");
        let new_robot_pos = robot_pos.add(&dir.unit());
        let mut move_positions: Vec<Pos> = Vec::from([robot_pos]);
        let mut push_queue: Vec<Pos> = Vec::from([new_robot_pos]);

        while !push_queue.is_empty() {
            let push_target = push_queue.pop().unwrap();

            if move_positions.contains(&push_target) { continue; }

            match grid_at(&new_grid, &push_target) {
                Space::Empty => (),
                Space::Wall => {
                    continue 'cannot_move;
                },
                Space::Block => {
                    move_positions.push(push_target);
                    push_queue.push(push_target.add(&dir.unit()));
                },
                Space::LeftBlock => {
                    move_positions.push(push_target);
                    move_positions.push(push_target.add(&Dir::Right.unit()));
                    if *dir != Dir::Right {
                        push_queue.push(push_target.add(&dir.unit()));
                    }
                    if *dir != Dir::Left {
                        push_queue.push(push_target.add(&dir.unit()).add(&Dir::Right.unit()));
                    }
                },
                Space::RightBlock => {
                    move_positions.push(push_target);
                    move_positions.push(push_target.add(&Dir::Left.unit()));
                    if *dir != Dir::Left {
                        push_queue.push(push_target.add(&dir.unit()));
                    }
                    if *dir != Dir::Right {
                        push_queue.push(push_target.add(&dir.unit()).add(&Dir::Left.unit()));
                    }
                },
                Space::Robot => panic!("Unexpected condition"),
            }
        }

        // Move the blocks in reverse order from how they were pushed
        //println!("Move {} entities ({:?})", move_positions.len(), move_positions);
        move_positions.sort_by(|a, b| b.dot(&dir.unit()).cmp(&a.dot(&dir.unit())));
        for block_position in move_positions {
            *grid_at_mut(&mut new_grid, &block_position.add(&dir.unit())) = grid_at(&new_grid, &block_position);
            *grid_at_mut(&mut new_grid, &block_position) = Space::Empty;
        }
        robot_pos = new_robot_pos;
    }

    new_grid
}


fn print_grid(grid: &Vec<Vec<Space>>) {
    print!("\n");
    for y in 0..grid.len() {
        for x in 0..grid[y].len() {
            print!("{}", grid[y][x].to_char());
        }
        print!("\n");
    }
    print!("\n");
}

fn main() {
    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");
    let input_parts: Vec<&str> = raw_input.trim().split("\n\n").collect();
    let grid: Vec<Vec<Space>> = input_parts[0]
        .split("\n")
        .map(|line| line.chars().map(|c| Space::parse(c)).collect())
        .collect();
    let instructions: Vec<Dir> = input_parts[1]
        .split("\n")
        .flat_map(|line| line.chars().map(|c| Dir::parse(c)))
        .collect();

    // Part 1
    {
        let after_moves = move_robot2(&grid, &instructions);
        let sum = after_moves
            .iter()
            .enumerate()
            .flat_map(|(y, row)| {
                row.iter().enumerate().map(move |(x, cell)| match cell {
                    Space::Block => x + y * 100,
                    _ => 0,
                })
            })
            .reduce(|acc, el| acc + el)
            .unwrap();
        print_grid(&after_moves);
        println!("Sum is {sum}");
    }

    // Part 2
    {
        let wide_grid: Vec<Vec<Space>> = grid
            .iter()
            .map(|row| {
                row.iter()
                    .flat_map(|cell| match cell {
                        Space::Empty => [Space::Empty, Space::Empty],
                        Space::Block => [Space::LeftBlock, Space::RightBlock],
                        Space::Robot => [Space::Robot, Space::Empty],
                        Space::Wall => [Space::Wall, Space::Wall],
                        _ => panic!("Unexpected input"),
                    })
                    .collect()
            })
            .collect();
        let after_moves = move_robot2(&wide_grid, &instructions);
        let sum = after_moves
            .iter()
            .enumerate()
            .flat_map(|(y, row)| {
                row.iter().enumerate().map(move |(x, cell)| match cell {
                    Space::LeftBlock => x + y * 100,
                    _ => 0,
                })
            })
            .reduce(|acc, el| acc + el)
            .unwrap();
        print_grid(&after_moves);
        println!("Sum is {sum}");
    }
}
