use std::env;
use std::fs;
use regex::Regex;

// Must solve simultaneously for:
//   A*ax + B*bx = px
//   A*ay + B*by = py
#[derive(Clone,Copy)]
struct Machine {
    ax: isize,
    ay: isize,
    bx: isize,
    by: isize,
    px: isize,
    py: isize,
}

impl Machine {
    fn price(&self) -> isize {
        // Solve analytically by inverting the 2x2 matrix
        let determinant = self.ax * self.by - self.ay * self.bx;
        if determinant == 0 {
            // No solution
            return 0
        }
        let a_determinant = self.by * self.px - self.bx * self.py;
        let b_determinant = self.ax * self.py - self.ay * self.px;
        if (a_determinant % determinant) != 0 || (b_determinant % determinant) != 0 {
            // No solution, we need to use fractional button presses
            return 0
        }
        if (a_determinant / determinant) < 0 || (b_determinant / determinant) < 0 {
            // No solution, we need to use negative button presses
            return 0
        }

        3 * (a_determinant / determinant) + (b_determinant / determinant)
    }
}

fn main() {
    let machine_re = Regex::new(r"Button A: X\+(\d+), Y\+(\d+)\nButton B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)").expect("Regex parsing failed");

    let raw_input = fs::read_to_string(env::args().nth(1).expect("Missing filename input"))
        .expect("Failed to read input");

    let machines: Vec<Machine> = raw_input.trim().split("\n\n").map(|machine_spec| {
        let machine_captures = machine_re.captures(machine_spec).expect("Regex match failed");
        Machine {
            ax: machine_captures.get(1).unwrap().as_str().parse().unwrap(),
            ay: machine_captures.get(2).unwrap().as_str().parse().unwrap(),
            bx: machine_captures.get(3).unwrap().as_str().parse().unwrap(),
            by: machine_captures.get(4).unwrap().as_str().parse().unwrap(),
            px: machine_captures.get(5).unwrap().as_str().parse().unwrap(),
            py: machine_captures.get(6).unwrap().as_str().parse().unwrap(),
        }
    }).collect();

    // Part 1
    {
        let total_price = machines.iter().map(|machine| machine.price()).reduce(|acc, el| acc + el).unwrap();
        println!("Total price is {total_price}");
    }

    // Part 2
    {
        let new_machines: Vec<Machine> = machines.clone().iter().map(|machine| Machine {
            ax: machine.ax,
            ay: machine.ay,
            bx: machine.bx,
            by: machine.by,
            px: machine.px + 10000000000000,
            py: machine.py + 10000000000000,
        }).collect();
        let total_price = new_machines.iter().map(|machine| machine.price()).reduce(|acc, el| acc + el).unwrap();
        println!("Total price is {total_price}");
    }
}
