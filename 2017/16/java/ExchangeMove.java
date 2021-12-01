
import java.util.HashMap;
import java.util.Map;

public class ExchangeMove extends Move {
  private final int posA, posB;

  public ExchangeMove(int posA, int posB) {
    this.posA = posA;
    this.posB = posB;
  }

  public void perform(char[] dancers) {
    char t = dancers[posA];
    dancers[posA] = dancers[posB];
    dancers[posB] = t;
  }

  public ComplexMove toComplexMove() {
    Map<Integer, Integer> moveMap = new HashMap<>();
    moveMap.put(posA, posB);
    moveMap.put(posB, posA);
    return new ComplexMove(moveMap);
  }

  @Override
  public String toString() {
    return String.format("ExchangeMove(%d, %d)", posA, posB);
  }
}
