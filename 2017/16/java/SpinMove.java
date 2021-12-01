
import java.util.HashMap;
import java.util.Map;

public class SpinMove extends Move {
  private final int size;

  public SpinMove(int size) {
    this.size = size;
  }

  public void perform(char[] dancers) {
    char[] t = new char[dancers.length];
    for (int i = 0; i < dancers.length; i++) {
      t[i] = dancers[i];
    }
    for (int i = 0; i < dancers.length; i++) {
      dancers[i] = t[(i - size + dancers.length) % dancers.length];
    }
  }

  public ComplexMove toComplexMove() {
    Map<Integer, Integer> moveMap = new HashMap<>();
    for (int i = 0; i < 16; i++) {
      moveMap.put((i - size + 16) % 16, i);
    }
    return new ComplexMove(moveMap);
  }

  @Override
  public String toString() {
    return String.format("SpinMove(%d)", size);
  }
}
