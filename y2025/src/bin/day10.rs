
use std::env;
use std::fs;
use regex::Regex;
use std::iter::once;
use good_lp::*;

struct Machine {
  goal: Vec<bool>,
  buttons: Vec<Vec<usize>>,
  joltage_requirements: Vec<usize>,
}

// Given a vector of presses for each button, returns the resulting display state
fn try_presses(machine: &Machine, presses: &Vec<usize>) -> Vec<bool> {
  let mut flips: Vec<usize> = vec![0; machine.goal.len()];

  for i in 0..presses.len() {
    for j in machine.buttons[i].iter() {
      flips[*j] += presses[i];
    }
  }

  //println!("Try {presses:?} result {flips:?}");

  flips.into_iter().map(|count| count % 2 == 1).collect()
}

// Given a vector of presses for each button, returns the resulting joltage state
fn try_presses_part2(machine: &Machine, presses: &Vec<usize>) -> Vec<usize> {
  let mut flips: Vec<usize> = vec![0; machine.goal.len()];

  for i in 0..presses.len() {
    for j in machine.buttons[i].iter() {
      flips[*j] += presses[i];
    }
  }

  flips
}

fn fewest_presses(machine: &Machine) -> usize {
  let mut potential_presses = 1;

  loop {
    if fewest_presses_recurse(&machine, &vec![], potential_presses) {
      break;
    } else {
      potential_presses += 1
    }
  }

  potential_presses
}

// Recursively checks for a solution using `partial_presses` and `remaining_presses`
fn fewest_presses_recurse(machine: &Machine, partial_presses: &Vec<usize>, remaining_presses: usize) -> bool {
  if machine.buttons.len() - partial_presses.len() == 1 {
    // If we have one button left, use all remaining_presses on the last button
    let state = try_presses(
        &machine,
        &partial_presses.iter().copied().chain(once(remaining_presses)).collect());
    state.iter().enumerate().all(|(i, value)| machine.goal[i] == *value)
  } else {
    //println!("partial_presses is {partial_presses:?}, recurse remaining {remaining_presses}");
    (0..=remaining_presses)
        .any(|next_presses| fewest_presses_recurse(
            &machine,
            &partial_presses.iter().copied().chain(once(next_presses)).collect(),
            remaining_presses - next_presses))
  }
}

fn fewest_presses_part2(machine: &Machine) -> usize {
  // Solve using Integer Linear Programming
  // Minimize: sum of all button presses
  // Subject to: for each joltage requirement j, sum_i(presses[i] * button_matrix[i][j]) = requirement[j]

  let mut vars = ProblemVariables::new();

  // Create integer variables for button presses (non-negative)
  let presses: Vec<Variable> = (0..machine.buttons.len())
      .map(|_| vars.add(variable().integer().min(0)))
      .collect();

  // Objective: minimize sum of all presses
  let objective = presses.iter().fold(Expression::from(0), |acc, &v| acc + v);

  let mut solver = vars.minimise(objective).using(default_solver);

  // Add constraints: for each joltage requirement
  for (req_idx, &req_value) in machine.joltage_requirements.iter().enumerate() {
      let constraint: Expression = presses.iter().enumerate()
          .map(|(button_idx, &press_var)| {
              // Check if this button affects this requirement
              let coeff = if machine.buttons[button_idx].iter().any(|&idx| idx == req_idx) { 1 } else { 0 };
              press_var * coeff
          })
          .fold(Expression::from(0), |acc, term| acc + term);

      solver = solver.with(constraint.eq(req_value as i32));
  }

  match solver.solve() {
      Ok(solution) => {
          let result: Vec<usize> = presses.iter().map(|&v| solution.value(v).round() as usize).collect();
          //println!("Solution: {:?}", result);

          // Verify the solution
          let computed_joltage = try_presses_part2(machine, &result);
          if computed_joltage != machine.joltage_requirements {
              panic!("Solution verification failed!\nSolution: {:?}\nComputed joltage: {:?}\nExpected joltage: {:?}",
                  result, computed_joltage, machine.joltage_requirements);
          }

          result.iter().sum()
      },
      Err(e) => {
          panic!("No solution found: {:?}", e)
      }
  }
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let line_re = Regex::new(r"\[([.#]+)\] ([\d\s(),]+) \{([\d,]+)\}").expect("Regex parsing failed");

  let machines: Vec<Machine> = raw_input.trim().split("\n")
      .map(|line| {
        let groups = line_re.captures(line).expect("Regex matching failed");

        let goal: Vec<bool> = groups.get(1).unwrap().as_str().chars()
            .map(|c| c == '#')
            .collect();

        let buttons: Vec<Vec<usize>> = groups.get(2).unwrap().as_str().split_whitespace()
            .map(|wiring_str| {
              let mut wiring_chars = wiring_str.chars();
              // Discard parentheses
              wiring_chars.next();
              wiring_chars.next_back();
              wiring_chars.as_str().split(",")
                  .map(|wiring_num| wiring_num.parse().unwrap())
                  .collect()
            })
            .collect();

        let joltage_requirements: Vec<usize> = groups.get(3).unwrap().as_str().split(",")
            .map(|joltage_num| joltage_num.parse().unwrap())
            .collect();

        Machine { goal, buttons, joltage_requirements }
      })
      .collect();

  let fewest_press_list: Vec<usize> = machines.iter().map(|machine| fewest_presses(&machine)).collect();
  println!("Fewest presses needed for display is {}: {:?}", fewest_press_list.iter().sum::<usize>(), fewest_press_list);

  let fewest_press_list_part2: Vec<usize> = machines.iter()
      .map(|machine| fewest_presses_part2(&machine))
      .collect();
  println!("Fewest presses needed for joltage is {}: {:?}", fewest_press_list_part2.iter().sum::<usize>(), fewest_press_list_part2);
}
