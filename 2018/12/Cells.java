import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class Cells {
  private static class State {
    private final long offset;
    private final boolean[] elements;

    /**
     * @param offset The index of the first element.
     * @param elements The elements in the state.
     */
    private State(long offset, boolean[] elements) {
      this.offset = offset;
      this.elements = elements;
    }

    public static State create(long offset, boolean[] cells) {
      return new State(offset, cells);
    }

    public int getInt(long i) {
      return get(i) ? 1 : 0;
    }

    public boolean get(long i) {
      if (i - offset < 0 || i - offset >= elements.length) {
        return false;
      } else {
        return elements[(int)(i - offset)];
      }
    }

    public long getMin() {
      for (int i = 0; i < elements.length; i++) {
        if (elements[i]) {
          return i + offset;
        }
      }
      throw new RuntimeException("No minimum");
    }

    public long getMax() {
      for (int i = elements.length - 1; i >= 0; i--) {
        if (elements[i]) {
          return i + offset;
        }
      }
      throw new RuntimeException("No maximum");
    }

    public State evolve(boolean[] rules) {
      long min = getMin() - 2;
      long max = getMax() + 2;
      boolean[] newStateArray = new boolean[(int)(max - min + 1)];
      int context = getInt(min) << 1 + getInt(min + 1);
      for (long x = min; x <= max; x++) {
        try {
          context = ((context << 1) & 0x1f) + getInt(x + 2);
          newStateArray[(int)(x - min)] = rules[context];
        } catch (Exception e) {
          System.out.println(String.format("min = %d, max = %d, x = %d", min, max, x));
          throw e;
        }
      }
      return new State(min, newStateArray);
    }

    public long value() {
      long value = 0;
      for (int i = 0; i < elements.length; i++) {
        if (elements[i]) {
          value += (i + offset);
        }
      }
      return value;
    }

    @Override
    public String toString() {
      String result = String.format("%3d: ", offset);
      for (boolean element : elements) {
        result += element ? '#' : '.';
      }
      return result;
    }

    @Override
    public boolean equals(Object o) {
      if (o instanceof State) {
        State other = (State) o;
        if (getMax() - getMin() != other.getMax() - other.getMin()) {
          return false;
        }
        long length = getMax() - getMin();
        long min = getMin();
        long otherMin = other.getMin();
        for (int i = 1; i < length; i++) {
          if (get(min + i) != other.get(otherMin + i)) {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    }

    @Override
    public int hashCode() {
      List<Integer> indices = new ArrayList<>();
      for (long i = getMin(); i < getMax(); i++) {
        if (get(i)) {
          indices.add((int)(i - getMin()));
        }
      }
      return Objects.hash(indices.stream().toArray());
    }
  }

  private static Pattern INITIAL_STATE = Pattern.compile("initial state: ([.#]+)");
  private static Pattern RULE = Pattern.compile("([\\.#]{5}) => ([.#])");

  public static void main(String[] args) throws Exception {
    List<String> lines = new BufferedReader(new InputStreamReader(new FileInputStream(new File("input.txt"))))
      .lines()
      .collect(Collectors.toList());

    Matcher initialStateMatcher = INITIAL_STATE.matcher(lines.get(0));
    initialStateMatcher.matches();
    String initialStateString = initialStateMatcher.group(1);
    boolean[] initialStateArray = new boolean[initialStateString.length()];
    for (int i = 0; i < initialStateString.length(); i++) {
      initialStateArray[i] = fromChar(initialStateString.charAt(i));
    }
    State initialState = State.create(0, initialStateArray);

    boolean[] rules = new boolean[32];
    for (String line : lines.subList(2, lines.size())) {
      Matcher matcher = RULE.matcher(line);
      matcher.matches();
      System.out.println(
          fromContext(matcher.group(1)) + " => " + fromChar(matcher.group(2).charAt(0)));
      rules[fromContext(matcher.group(1))] = fromChar(matcher.group(2).charAt(0));
    }

    //System.out.println(getState(initialState, rules, 20).value());
    System.out.println(getState(initialState, rules, 50000000000L).value());
  }

  private static State getState(State initialState, boolean[] rules, long steps) {
    State currentState = initialState;
    HashSet<State> history = new HashSet<>();
    history.add(initialState);
    for (long i = 0; i < steps; i++) {
      if (i % 1E7 == 0) {
        System.out.println("progress = " + (i * 1.0 / steps));
      }
      currentState = currentState.evolve(rules);
      if (history.contains(currentState)) {
        System.out.println(String.format("cycle detected"));
      }
      //if (history.containsKey(currentState)) {
      //  System.out.println(String.format("cycle at t = %d (%d)", i, history.get(currentState)));
      //}
      //history.put(currentState, i);
    }
    return currentState;
  }

  private static int fromContext(String context) {
    int value = 0;
    for (int i = 0; i < context.length(); i++) {
      value <<= 1;
      value += fromChar(context.charAt(i)) ? 1 : 0;
    }
    return value;
  }

  private static boolean fromChar(char c) {
    if (c == '#') {
      return true;
    } else if (c == '.') {
      return false;
    } else {
      throw new RuntimeException("Invalid input");
    }
  }

  private static String matchGroup(Pattern p, String s, int group) {
    Matcher matcher = p.matcher(s);
    if (matcher.matches()) {
      return matcher.group(group);
    } else {
      return null;
    }
  }
}
