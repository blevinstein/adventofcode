
use std::env;
use std::fs;
use std::collections::HashSet;
use regex::Regex;

#[derive(Debug,Eq,Clone,PartialEq,Hash,Ord,PartialOrd)]
enum MagicType {
  Generator,
  Microchip,
}

#[derive(Debug,Eq,PartialEq,Hash,Clone,Ord,PartialOrd)]
struct MagicObject {
  magicType: MagicType,
  element: usize,
}

#[derive(Debug,Clone,Hash,Eq,PartialEq)]
struct MagicState {
  objects: Vec<Vec<MagicObject>>,
  elevator: usize,
}

fn any_fried(objects: &Vec<Vec<MagicObject>>) -> bool {
  objects.iter().any(|floor|
    floor.iter().any(|obj_a|
      obj_a.magicType == MagicType::Microchip
        // No matching generator
        && !floor.iter().any(|obj_b|
          obj_b.magicType == MagicType::Generator
            && obj_b.element == obj_a.element)
        // One non-matching generator
        && floor.iter().any(|obj_b|
          obj_b.magicType == MagicType::Generator
            && obj_b.element != obj_a.element)))
}

fn is_done(objects: &Vec<Vec<MagicObject>>) -> bool {
  objects[..objects.len()-1].iter().all(|floor| floor.is_empty())
}

fn next_states(state: &MagicState) -> Vec<MagicState> {
  let mut result: Vec<MagicState> = vec![];

  let new_elevators: Vec<usize> = vec![state.elevator as isize + 1, state.elevator as isize - 1]
      .into_iter()
      .filter_map(|new_elevator|
        if 0 <= new_elevator && new_elevator < state.objects.len() as isize {
          Some(new_elevator as usize)
        } else {
          None
        })
      .collect();

  let single_objects: Vec<MagicObject> = state.objects[state.elevator].clone();
  let double_objects: Vec<(MagicObject, MagicObject)> = state.objects[state.elevator]
      .iter()
      .enumerate()
      .flat_map(|(i, obj_i)|
            state.objects[state.elevator][i+1..]
                .iter()
                .map(|obj_j| (obj_i.clone(), obj_j.clone()))
                .collect::<Vec<(MagicObject, MagicObject)>>())
            .collect();

  for new_elevator in new_elevators {
    for single_object in single_objects.iter() {
      let mut new_objects = state.objects.clone();
      new_objects[state.elevator].retain(|obj| *obj != *single_object);
      new_objects[new_elevator].push(single_object.clone());
      new_objects[new_elevator].sort();
      result.push(MagicState { objects: new_objects, elevator: new_elevator });
    }
    for (obj_a, obj_b) in double_objects.iter() {
      let mut new_objects = state.objects.clone();
      new_objects[state.elevator].retain(|obj| *obj != *obj_a && *obj != *obj_b);
      new_objects[new_elevator].push(obj_a.clone());
      new_objects[new_elevator].push(obj_b.clone());
      new_objects[new_elevator].sort();
      result.push(MagicState { objects: new_objects, elevator: new_elevator });
    }
  }

  result
}

fn min_steps(initial_state: &MagicState) -> usize {

  let mut states: HashSet<MagicState> = vec![initial_state.clone()].into_iter().collect();
  let mut visited: HashSet<MagicState> = HashSet::new();

  let mut steps = 0;

  while !states.iter().any(|state| is_done(&state.objects)) {
    println!("steps = {}, size = {}, not done...", steps, states.len());
    steps += 1;
    visited.extend(states.iter().cloned());
    states = states.iter()
        .flat_map(|state| next_states(&state))
        .filter(|state| !any_fried(&state.objects) && !visited.contains(state))
        .collect();
  }

  steps
}

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let object_re = Regex::new(r"a (\w+)(-compatible microchip| generator)").unwrap();
  let and_re = Regex::new(r"(, | and )").unwrap();

  // First, parse with String elements
  let input_with_strings: Vec<Vec<(MagicType, String)>> = raw_input.trim().split("\n")
      .map(|line| {
        let (_, contents) = line.split_once(" contains ").unwrap();
        if contents == "nothing relevant." {
          vec![]
        } else {
          and_re.split(contents).map(|object_raw| {
            let captures = object_re.captures(object_raw).expect("Failed to match regex");
            let element = captures[1].to_string();
            match &captures[2] {
              "-compatible microchip" => (MagicType::Microchip, element),
              " generator" => (MagicType::Generator, element),
              _ => panic!("Unexpected type string"),
            }
          }).collect()
        }
      })
      .collect();

  // Build element library (including elerium and dilithium for part 2)
  let mut element_library: Vec<String> = input_with_strings
      .iter()
      .flat_map(|floor| floor.iter().map(|(_, element)| element.clone()))
      .collect();
  element_library.push("elerium".to_string());
  element_library.push("dilithium".to_string());

  // Convert to usize indices
  let input: Vec<Vec<MagicObject>> = input_with_strings
      .iter()
      .map(|floor| {
        floor.iter().map(|(magic_type, element)| {
          let element_idx = element_library.iter().position(|e| e == element).unwrap();
          MagicObject {
            magicType: magic_type.clone(),
            element: element_idx,
          }
        }).collect()
      })
      .collect();

  let elerium_idx = element_library.iter().position(|e| e == "elerium").unwrap();
  let dilithium_idx = element_library.iter().position(|e| e == "dilithium").unwrap();

  println!("part 1: {} steps", min_steps(&MagicState { objects: input.clone(), elevator: 0 }));

  let mut initial_state_part2 = MagicState { objects: input.clone(), elevator: 0 };
  initial_state_part2.objects[0].push(MagicObject { magicType: MagicType::Generator, element: elerium_idx });
  initial_state_part2.objects[0].push(MagicObject { magicType: MagicType::Microchip, element: elerium_idx });
  initial_state_part2.objects[0].push(MagicObject { magicType: MagicType::Generator, element: dilithium_idx });
  initial_state_part2.objects[0].push(MagicObject { magicType: MagicType::Microchip, element: dilithium_idx });

  println!("part 2: {} steps", min_steps(&initial_state_part2));
}
