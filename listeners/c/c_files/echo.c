#include "c.h"

xmod_t * xmod_init(void);
static void xmod_fini(xmod_t *);
static void * xmod_triggers_get(void);

static xmod_t xmod;

static char * echo (void *);

static trigger_t t[3] = {
{
	"\"e\"", NULL, echo, "echos the supplied string"
},
{
	"\"echo\"", NULL, echo, "echos the supplied string"
},
{
	NULL, NULL, NULL, NULL
}
};

xmod_t * xmod_init(void) {

	xmod_t * xmod = calloc(1,sizeof(xmod_t));
	xmod->name = "echo";
	xmod->init = xmod_init;
	xmod->fini = xmod_fini;
    xmod->triggers_get = xmod_triggers_get;

	return xmod;
}

static void xmod_fini(xmod_t*v) {
	return NULL;
}


static void * xmod_triggers_get(void) {
	return t;
}


static char * echo(void * v) {

	char ** string_array = v;
	
	char buf[1024];

	int x, new_start=0;

	memset(buf,0,sizeof(buf));
	for(x=0;string_array[x]!=NULL;x++) {
//		string_array[x][strlen(string_array[x])-1] = '\0';

/*
		if(x != 0) {
			new_start = 0;
			string_array[x][0] = ' ';
		} else { new_start = 1; }
*/
if(x != 0) {
	strncat(buf," ",sizeof(buf)-1);
}

		strncat(buf,&string_array[x][new_start], sizeof(buf)-1);
	}


	return strdup(buf);
}
