#include "c.h"

xmod_t * xmod_init(void);
static void xmod_fini(xmod_t *);
static void * xmod_triggers_get(void);

static xmod_t xmod;

static char * nop(void *);

static trigger_t t[2] = {
{
    "\"nop\"", NULL, nop, "no operation"
},
{
    NULL, NULL, NULL, NULL
}
};

xmod_t * xmod_init() {

	xmod_t * xmod = calloc(1,sizeof(xmod_t));
	xmod->name = "nop";
	xmod->init = xmod_init;
	xmod->fini = xmod_fini;
    xmod->triggers_get = xmod_triggers_get;

	return xmod; 
}

static void xmod_fini(xmod_t *v) {
	return NULL;
}

static void * xmod_triggers_get(void) {
puts("xmod_triggers_get: nop");
	return t;
}

static char * nop(void * v) {
	return (char *)strdup("");
}
