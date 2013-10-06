#ifndef C_H
#define C_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <ctype.h>
#include <dirent.h>
#include <dlfcn.h>
#include <time.h>
#include <sys/types.h>
#include <sys/time.h>
#include <sys/times.h>
#include "hiredis.h"
#include <json.h>
#include <stddef.h>



#define DEF_MODULES_DIR "c_files"
#define DEF_MAX_TRIGGERS 20


typedef struct info {
	redisContext * sub;
	redisContext * pub;
} info_t;

/* "0.6711119036190212:0.4203165993094444:undefined:any:any:_ampd:#darqbot:[\"vping\"]" */
typedef struct Did {
	char * pipeline;
	char * expression;
} did_t;

typedef struct Node {
	char * tunnel;
	char * listener;
} node_t;

typedef struct Chat {
	char * from;
	char * to;
	char * cmd;
} chat_t;

typedef struct ts { 
	char * user;
	char * sys;
	char user_buf[32];
	char sys_buf[32];
	clock_t udiff;
	clock_t sdiff;
	struct tms tms_start;
	clock_t cl_start;
	struct tms tms_end;
	clock_t cl_end;
} ts_t;

typedef struct Message {

	did_t did;
	char * type;
	char * opts;
	ts_t tsCmd;
	node_t node; 
	chat_t chat;
		
	json_object * js;
	array_list * js_array;
	int js_len;
} message_t;


int fillTime(ts_t *, int);
int messageCreateRedisString(message_t *,char *, int, char *);
int messageParse(info_t *, redisReply *);



/*
 * xmod's {triggers}
 */

typedef struct XMod {
	char * name;
	struct XMod * (*init)(void);
	void (*fini)(struct XMod *);
	void * (*triggers_get)(void);
} xmod_t;

xmod_t * xmod_load(char *);
void xmod_unload(xmod_t *);


typedef struct Modules {
	xmod_t * xmod;
	struct Modules * next;
} modules_t;

modules_t * modules;

void modules_load(void);
void modules_add(xmod_t *);
void modules_del(modules_t *);


typedef struct Trigger {
	char * trigger;
	xmod_t * xmod;
	char * (*fn)(void *);
	char * help;
} trigger_t;

typedef struct Triggers {
	trigger_t triggers[DEF_MAX_TRIGGERS+1];
	int loc;
} triggers_t;

triggers_t triggers;

#endif
