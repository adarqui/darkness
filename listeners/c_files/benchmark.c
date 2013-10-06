#include "c.h"

xmod_t * xmod_init(void);
static void xmod_fini(xmod_t *);
static void * xmod_triggers_get(void);
static char * benchmark_randloop(char **);
static char * benchmark_readurandom(char **);

static xmod_t xmod;

static char * benchmark (void *);

static trigger_t t[2] = {
{
	"\"benchmark\"", NULL, benchmark, "benchmarks the supplied string"
},
{
	NULL, NULL, NULL, NULL
}
};

xmod_t * xmod_init(void) {

	xmod_t * xmod = calloc(1,sizeof(xmod_t));
	xmod->name = "benchmark";
	xmod->init = xmod_init;
	xmod->fini = xmod_fini;
    xmod->triggers_get = xmod_triggers_get;

	return xmod;
}

static void xmod_fini(xmod_t*v) {
	return;
}


static void * xmod_triggers_get(void) {
	return t;
}


static char * benchmark(void * v) {

	char ** string_array = v;
	
	char buf[1024];

	int x, new_start=0;

/*
	memset(buf,0,sizeof(buf));
	for(x=0;string_array[x]!=NULL;x++) {
if(x != 0) {
	strncat(buf," ",sizeof(buf)-1);
}

		strncat(buf,&string_array[x][new_start], sizeof(buf)-1);
	}



*/



	if(!strcasecmp(string_array[0], "randloop")) {
		return benchmark_randloop(&string_array[1]);
	}
	else if(!strcasecmp(string_array[0], "readurandom")) {
		return benchmark_readurandom(&string_array[1]);
	}


	return strdup(buf);
}


static char * benchmark_randloop(char **string_array) {

	int default_max = 50, i;

	if(!string_array) return NULL;

	if(string_array[0] != NULL) {
		default_max = atoi(string_array[0]);
	}

	for(i=0;i<default_max;i++) {
		rand();
	}
	
	return strdup("randloop,c");
}


static char * benchmark_readurandom(char **string_array) {
	char * ptr;
	int default_max = 100, i, fd;
	if(!string_array) return NULL;
	if(string_array[0] != NULL) {
		default_max = atoi(string_array[0]);
	}
	fd = open("/dev/urandom", O_RDONLY);
	if(fd < 0) {
	}

	ptr = malloc(default_max+1);

	read(fd,ptr,default_max);
	
	free(ptr);

	close(fd);

	return strdup("readurandom,c");
	
}
