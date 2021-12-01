
import java.util.HashMap;
import java.util.Map;

public class ComplexMove extends Move {
  private final Map<Integer, Integer> moveMap;

  public ComplexMove(Map<Integer, Integer> moveMap) {
    this.moveMap = moveMap;
  }

  public void perform(char[] dancers) {
    char[] t = new char[dancers.length];
    for (Integer i : moveMap.keySet()) {
      t[i] = dancers[i];
    }
    for (Map.Entry<Integer, Integer> entry : moveMap.entrySet()) {
      dancers[entry.getValue()] = t[entry.getKey()];
    }
  }

  public ComplexMove andThen(ComplexMove next) {
    Map<Integer, Integer> mergedMap = new HashMap<>();
    for (Map.Entry<Integer, Integer> entry : moveMap.entrySet()) {
      if (next.moveMap.containsKey(entry.getValue())) {
        mergedMap.put(entry.getKey(), next.moveMap.get(entry.getValue()));
      } else {
        mergedMap.put(entry.getKey(), entry.getValue());
      }
    }
    for (Map.Entry<Integer, Integer> nextEntry : next.moveMap.entrySet()) {
      if (!moveMap.containsValue(nextEntry.getKey())) {
        mergedMap.put(nextEntry.getKey(), nextEntry.getValue());
      }
    }
    return new ComplexMove(mergedMap);
  }
}
