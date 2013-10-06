FLAGS = -Wall --std=c99 -rdynamic
HEADERS = -I ../ -I ../c_libs/hiredis/ -I /usr/local/include/json-c
LINKER = -levent -ldl -fPIC -lc -L/usr/local/lib/ -ljson-c

all:
	gcc $(HEADERS) $(FLAGS) $(LINKER) -shared echo.c -o echo.so
	gcc $(HEADERS) $(FLAGS) $(LINKER) -shared nop.c -o nop.so
	gcc $(HEADERS) $(FLAGS) $(LINKER) -shared ping.c -o ping.so
	gcc $(HEADERS) $(FLAGS) $(LINKER) -shared benchmark.c -o benchmark.so

clean:
	rm -f *.so
