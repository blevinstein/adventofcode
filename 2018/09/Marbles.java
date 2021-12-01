
public class Marbles {
  public static class Node {
    private long value;
    private Node prev;
    private Node next;
    public Node(long value, Node prev, Node next) {
      this.value = value;
      this.prev = prev;
      this.next = next;
    }

    public void setNext(Node next) {
      this.next = next;
    }

    public void setPrev(Node prev) {
      this.prev = prev;
    }

    public long getValue() {
      return value;
    }

    public Node rotate(int offset) {
      if (offset == 0) {
        return this;
      } else if (offset > 0) {
        return this.next.rotate(offset - 1);
      } else {
        return this.prev.rotate(offset + 1);
      }
    }

    public Node insert(long newValue) {
      Node newNode = new Node(newValue, this, this.next);
      this.next.setPrev(newNode);
      this.setNext(newNode);
      return newNode;
    }

    public long remove() {
      this.next.setPrev(this.prev);
      this.prev.setNext(this.next);
      return this.value;
    }

    public void dump() {
      System.out.print(this.value + " ");
      Node node = this.next;
      while (node.value != this.value) {
        System.out.print(node.value + " ");
        node = node.next;
      }
      System.out.println();
    }
  }

  public static long max(long[] values) {
    long result = values[0];
    for (long value : values) {
      if (value > result) {
        result = value;
      }
    }
    return result;
  }

  public static long[] marbleGame(int numPlayers, int numMarbles) {
    long[] scores = new long[numPlayers];
    Node currentMarble = new Node(0, null, null);
    currentMarble.setNext(currentMarble);
    currentMarble.setPrev(currentMarble);
    for (int i = 1; i < numMarbles; i++) {
      //if (i % 10000 == 0) {
      //  System.out.println(i * 1.0 / numMarbles);
      //}
      int currentPlayer = i % numPlayers;
      if (i % 23 == 0) {
        scores[currentPlayer] += i;
        Node nextMarble = currentMarble.rotate(-6);
        scores[currentPlayer] += currentMarble.rotate(-7).remove();
        currentMarble = nextMarble;
      } else {
        currentMarble = currentMarble.rotate(1).insert(i);
      }
    }
    return scores;
  }

  public static void main(String[] args) {
    System.out.println(max(marbleGame(441, 7103200)));
  }
}
