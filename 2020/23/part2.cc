
#include <iostream>
#include <cstring>

using namespace std;

//const long long CUPS = 9;
//const long long MOVES = 100;
const long long CUPS = 1000000L;
const long long  MOVES = 10000000L;

struct Cup {
  long long label;
  Cup* next_cup;
};

void print_cups(const Cup& current_cup, const long long cups = 10) {
  const Cup *it = &current_cup;
  for (long long i = 0; i < cups; ++i) {
    cout << it->label << " ";
    it = it->next_cup;
  }
  cout << endl;
}

int main(int argc, char **argv) {
  //string input("389125467");
  string input = "974618352";
  cout << "Initializing cups" << endl << flush;
  Cup *cups = new Cup[CUPS];
  Cup **cups_by_label = new Cup*[CUPS+1];
  for (int i = 0; i < input.length(); ++i) {
    const int label = stoi(input.substr(i, 1));
    //cout << "Add label " << label << " at location " << i << endl;
    cups[i].label = label;
    cups[i].next_cup = &cups[(i+1) % CUPS];
    cups_by_label[label] = &cups[i];
  }
  for (int i = input.length(); i < CUPS; ++i) {
    const int label = i+1;
    //cout << "Add label " << label << " at location " << i << endl;
    cups[i].label = label;
    cups_by_label[label] = &cups[i];
    cups[i].next_cup = &cups[(i+1) % CUPS];
  }

  Cup *current_cup = &cups[0];
  //print_cups(*current_cup, 100);

  cout << "Starting moves" << endl;
  for (int m = 0; m < MOVES; ++m) {
    if (m % 1000000 == 0) {
      cout << "Move = " << m << endl;
    }
    // Remove three cups
    Cup *removed_cups = current_cup->next_cup;
    current_cup->next_cup = current_cup->next_cup->next_cup->next_cup->next_cup;
    //cout << "Removed: ";
    //print_cups(*removed_cups, 3);
    // Pick a target cup
    int target_label = current_cup->label;
    do {
      target_label--;
      if (target_label < 1) { target_label = CUPS; }
    } while (removed_cups->label == target_label
        || removed_cups->next_cup->label == target_label
        || removed_cups->next_cup->next_cup->label == target_label);
    //cout << "Destination: " << target_label << endl;
    // Insert the removed cups in front of the target cup.
    Cup *target_cup = cups_by_label[target_label];
    removed_cups->next_cup->next_cup->next_cup = target_cup->next_cup;
    target_cup->next_cup = removed_cups;
    // Advance the current cup pointer
    current_cup = current_cup->next_cup;
    //print_cups(*current_cup);
  }

  Cup *next = cups_by_label[1]->next_cup;
  cout << next->label << " x " << next->next_cup->label << " = " << next->label * next->next_cup->label << endl;

  return 0;
}
