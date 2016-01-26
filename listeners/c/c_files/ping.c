#include "c.h"

xmod_t * xmod_init(void);
static void xmod_fini(xmod_t *);
static void * xmod_triggers_get(void);


static char * vping (void *);
static char * ping (void *);



static trigger_t t[3] = {
{
	"\"ping\"", NULL, ping, "responds with a pong",
},
{
    "\"vping\"", NULL, vping, "responds with who processed the ping"
},
{
	NULL, NULL, NULL, NULL
},
};


xmod_t * xmod_init(void) {


	xmod_t * xmod = calloc(1,sizeof(xmod_t));
	xmod->name = "ping";
	xmod->init = xmod_init;
	xmod->fini = xmod_fini;
	xmod->triggers_get = xmod_triggers_get;

	return xmod;
}

static void xmod_fini(xmod_t *v) {
	return NULL;
}



static void * xmod_triggers_get(void) {
	puts("xmod_triggers_get: ping");
	return t;
}


static char * ping(void *v) {
	return (char *)strdup("pong");
}

static char * vping(void *v) {
	return (char *)strdup("c");
}
