
use std::env;
use std::fs;
use md5;

fn main() {
  let raw_input = fs::read_to_string(env::args().nth(1).unwrap())
      .expect("Failed to read input");

  let input = raw_input.trim();

  let mut password_chars: Vec<char> = Vec::new();
  let mut advanced_password_chars: Vec<Option<char>> = vec![None; 8];
  let mut step = 0;

  loop {
    let digest = md5::compute(format!("{input}{step}"));
    let hash = format!("{digest:?}");
    //println!("Hash is {hash}");
    if hash.starts_with("00000") {
      println!("found {} {}", hash.chars().nth(5).unwrap(), hash.chars().nth(6).unwrap());

      // Part 1, simple password
      if password_chars.len() < 8 {
        println!("push char {}", hash.chars().nth(5).unwrap());
        password_chars.push(hash.chars().nth(5).unwrap());
      }

      // Part 2, advanced password
      let maybe_position = hash.chars().nth(5).unwrap().to_string().parse::<u8>();
      if let Ok(position) = maybe_position {
        if position < 8 && advanced_password_chars[position as usize].is_none() {
          println!("set char {} => {}", position, hash.chars().nth(6).unwrap());
          advanced_password_chars[position as usize] = Some(hash.chars().nth(6).unwrap());
        }
      }

      // Exit conditions
      if password_chars.len() == 8 && advanced_password_chars.iter().all(|c| c.is_some()) {
        break;
      }
    }

    step += 1;
    if step % 1000000 == 0 {
      println!("Step {step}...");
    }
  }
  let password: String = password_chars.into_iter().collect();
  println!("Password is {password}");

  let advanced_password: String = advanced_password_chars.into_iter().flatten().collect();
  println!("Advanced password is {advanced_password}");
}
