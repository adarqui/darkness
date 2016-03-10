#include <iostream>

int main(int argc, char **argv) {
  int opt_n = 1;
  int start_index = 1;
  int index;

  if (argc > 1 && !strcmp(argv[1], "-n")) {
    opt_n = 0;
    start_index = 2;
  }

  for (index = start_index; index < argc; index++) {
    std::cout << argv[index];
    if (index != argc) {
      std::cout << " ";
    }
  }

  if (opt_n) {
    std::cout << std::endl;
  }

  return 0;
}
