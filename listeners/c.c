#include "c.h"


/*
man times
man gettimeofday
http://stackoverflow.com/questions/13610471/calculating-function-time-in-nanoseconds-in-c-code
http://stackoverflow.com/questions/12937963/get-local-time-in-nanoseconds
*/


void itoa(clock_t v, char * buf, int sz) {

	int n;
	n = snprintf(buf,sz,"%u",v);
	buf[n]='\0';

	return;		
}

char * itoa_static(int x) {
	static char buf[132];
	memset(buf,0,sizeof(buf));
	snprintf(buf,sizeof(buf)-1,"%i",x);
	return buf;
}


void triggers_add(trigger_t *trig) {
	int i;

}

xmod_t * xmod_load(char * filename) {
	xmod_t * (*xmod_init)(void);
	xmod_t * xmod=NULL;
	void * h = dlopen(filename, RTLD_LAZY | RTLD_GLOBAL);
	if(h==NULL) return NULL;

	xmod_init = dlsym(h, "xmod_init");
	xmod = xmod_init();

	return xmod;
}

void xmod_unload(xmod_t *xmod) {
}


void modules_add(xmod_t *xmod) {

	modules_t * module, *mod_prev;
	if(!xmod) return;
	module = (modules_t *) calloc(1,sizeof(modules_t));
	if(!module) return;

	mod_prev = modules;
	modules = module;
	module->next = mod_prev;
}

void modules_load(void) {
	DIR * dir = NULL;
	struct dirent * de_ptr=NULL;

trigger_t *trigs;

	dir = opendir(DEF_MODULES_DIR);
	if(!dir) errx(2, "load_modules: opendir: ");

	
	while(1) {
		xmod_t * xmod;
		char buf[255];

		de_ptr = readdir(dir);
		if(de_ptr==NULL) break;

		if(strstr(de_ptr->d_name, ".so")==NULL) continue;

		memset(buf,0,sizeof(buf));
		snprintf(buf,sizeof(buf)-1,"%s/%s", DEF_MODULES_DIR, de_ptr->d_name);
		printf("name: %s\n", buf);

		xmod = xmod_load(buf);
		if(!xmod) continue;

		modules_add(xmod);

trigs = xmod->triggers_get();
if(trigs != NULL) {
	int i;
	for(i=0;trigs[i].trigger!=NULL;i++) {
		memcpy(&triggers.triggers[triggers.loc], &trigs[i],sizeof(trigger_t));
		triggers.loc += 1;
	}
}


	}

}

void messagePrint(message_t * m) {
	if(m == NULL) return;

	printf(
		"Printing message:\n"
		"\tdid.pipeline:\t%s\n"
		"\tdid.expression:\t%s\n"
		"\ttype:\t\t%s\n"
		"\topts:\t\t%s\n"
		"\tts.command.user:\t%s\n"
		"\tts.command.sys:\t%s\n"
		"\tnode.tunnel:\t%s\n"
		"\tnode.listener:\t%s\n"
		"\tchat.from:\t%s\n"
		"\tchat.to:\t\t%s\n"
		"\tchat.cmd:\t%s\n"
		,
		m->did.pipeline,
		m->did.expression,
		m->type,
		m->opts,
		m->tsCmd.user,
		m->tsCmd.sys,
		m->node.tunnel,
		m->node.listener,
		m->chat.from,
		m->chat.to,
		m->chat.cmd);

	printf(
        "\t\ttsCmd:\n"
        "\t\t\tcl:\tstart=%u, end=%u, diff=%u\n"
        "\t\t\tuser:\tstart=%u, end=%u, diff=%u\n"
        "\t\t\tsys:\tstart=%u, end=%u, diff=%u\n"
		,
        m->tsCmd.cl_start, m->tsCmd.cl_end, m->tsCmd.cl_end - m->tsCmd.cl_start,
        m->tsCmd.tms_start.tms_utime, m->tsCmd.tms_end.tms_utime, m->tsCmd.tms_end.tms_utime - m->tsCmd.tms_start.tms_utime,
        m->tsCmd.tms_start.tms_stime, m->tsCmd.tms_end.tms_stime, m->tsCmd.tms_end.tms_stime - m->tsCmd.tms_start.tms_stime
		);
		

	return;
}


int  messageCreateRedisString(message_t * m, char * buf, int sz, char * reply) {
	if(!buf || !m || sz <= 0) return -1;

    return snprintf(buf,sz,
        "%s:%s:%s:%s:%s:%s:%s:%s:%s:%s:%s"
        ,
        m->did.pipeline,
        m->did.expression,
        m->type,
        m->opts,
        m->tsCmd.user_buf,
        m->tsCmd.sys_buf,
        m->node.tunnel,
        "c",
        m->chat.from,
        m->chat.to,
        reply);
}

int fillTime(ts_t *t, int type) {
	if(!t) return -1;
	
	if(type == 0) {
		t->cl_end = times(&t->tms_end);
	}
	else {
		t->cl_start = times(&t->tms_start);
	}

	return 0;
}

int fixTime(ts_t *ts) {

	if(!ts) return -1;

	ts->udiff = ts->tms_end.tms_utime - ts->tms_start.tms_utime;
	ts->sdiff = ts->tms_end.tms_stime - ts->tms_start.tms_stime;

	return 0;
}

int messageParse(info_t * info, redisReply * rr) {
	struct json_object * js_ptr=NULL;
	json_type js_type;
	redisReply *rr_pub=NULL;
	message_t m;
	char * msg = NULL, *ptr=NULL, reply[10024], *res=NULL;
	int n=0, err=0;

	if(rr == NULL) return -1;

	msg = rr->str;

	m.js = NULL;
/*
stimuli:
    <pipeline>:<expression>:<type>:<options>:<ts-user-parse>:<ts-sys-parse>:<ts-user-command>:<ts-sys-commandd>:<tunnel>:<listener>:<from>:<to>:<STIMULI:JSON>
response:
    <pipeline>:<expression>:<type>:<options>:<ts-user-parse>:<ts-sys-parse>:<ts-user-command>:<ts-sys-commandd>:<tunnel>:<listener>:<from>:<to>:<RESPONSE:STRING>
*/

	m.did.pipeline = strtok(msg, ":");
	m.did.expression = strtok(NULL, ":");
	m.type = strtok(NULL, ":");
	m.opts = strtok(NULL, ":");
	m.tsCmd.user = strtok(NULL, ":");
	m.tsCmd.sys = strtok(NULL, ":");
	m.node.tunnel = strtok(NULL, ":");
	m.node.listener = strtok(NULL, ":");
	m.chat.from = strtok(NULL, ":");
	m.chat.to = strtok(NULL, ":");
	m.chat.cmd = strtok(NULL, ":");

//	messagePrint(&m);

	m.js = json_tokener_parse(m.chat.cmd);

	if(!m.js) goto cleanup;

	m.js_array = json_object_get_array(m.js);
	if(!m.js_array) goto cleanup;

	m.js_len = json_object_array_length(m.js);
	if(m.js_len <= 0) goto cleanup;

    js_ptr = json_object_array_get_idx(m.js, 0);
	if(!js_ptr) goto cleanup;

	m.js_len = json_object_array_length(m.js);

	ptr = json_object_to_json_string(js_ptr);
	if(!ptr) goto cleanup;

	int i;
	for(i=0;triggers.triggers[i].trigger!=NULL;i++) {
		if(!strcasecmp(ptr, triggers.triggers[i].trigger)) {

json_object * json_string_ptr=NULL;
char ** string_array = NULL, *string_ptr=NULL;

string_array = (char **) calloc(1,sizeof(char *)*(m.js_len+1));
int x;
for(x=1;x<m.js_len;x++) {
	json_string_ptr = json_object_array_get_idx(m.js, x);
	js_type = json_object_get_type(json_string_ptr);
	if(js_type == json_type_string) {
		string_ptr = json_object_to_json_string(json_string_ptr);

if(string_ptr[0] == '"') {
	string_ptr = &string_ptr[1];
}

if(string_ptr[strlen(string_ptr)-1] == '"') {
	string_ptr[strlen(string_ptr)-1] = '\0';
}


	} else if(js_type == json_type_int) {
		int z;
		z = json_object_get_int(json_string_ptr);
		string_ptr = itoa_static(z);


	}
	string_array[x-1] = strdup(string_ptr);
}

			fillTime(&m.tsCmd,1);
				res = triggers.triggers[i].fn(string_array);
			fillTime(&m.tsCmd,0);

for(x = 0; string_array[x] != NULL ; x++) {
free(string_array[x]);
}
free(string_array);
string_array = NULL;

			break;
		}
	}


	if(res != NULL) {

		n = fixTime(&m.tsCmd);
		if(n >= 0) {
			itoa(m.tsCmd.udiff, m.tsCmd.user_buf, sizeof(m.tsCmd.user_buf)-1);
			itoa(m.tsCmd.sdiff, m.tsCmd.sys_buf, sizeof(m.tsCmd.sys_buf)-1);
		}

		n = messageCreateRedisString(&m, reply, sizeof(reply)-1, res);

		free(res);

		if(n < 0) { err = -1; goto cleanup; }

rr_pub = redisCommand(info->pub, "PUBLISH %s %s", "dbot:reply", reply);
		if(rr_pub == NULL) { printf("ERROR\n"); }
	}
	
	cleanup:
	if(js_ptr) json_object_put(js_ptr);
	if(m.js) json_object_put(m.js);

//	messagePrint(&m);

	return err;
}


int main(int argc, char * argv[]) {

	info_t info;
	struct redisReply * rr = NULL;
	int ret = 0;


	/* fix me */
	modules_load();
	
	redisContext *sub = redisConnect("127.0.0.1", 6379);	
	if(sub != NULL && sub->err) {
		printf("Error: %s\n", sub->errstr);
		exit(-1);
	}

	redisContext *pub = redisConnect("127.0.0.1", 6379);
	if(pub != NULL && pub->err) {
		printf("Error: %s\n", sub->errstr);
		exit(-1);
	}

	info.sub = sub;
	info.pub = pub;

	puts("Connected!");

	rr = redisCommand(sub, "SUBSCRIBE %s", "dbot:eval");

	if(rr == NULL) {
		printf("Error: redisCommand(dbot:eval)\n");
		exit(-1);
	}


	freeReplyObject(rr);

	rr = redisCommand(sub, "SUBSCRIBE %s", "dbot:c");

	freeReplyObject(rr);

	while(1) {
		ret = redisGetReply(sub,(void **)&rr);
		if(ret != REDIS_OK) {
			continue;
		}

		if(rr->type != REDIS_REPLY_ARRAY) goto cleanup;
		
		int i;
		redisReply * rr_ptr;

		if(rr->elements < 3) continue;

		messageParse(&info, rr->element[2]);

		cleanup:
		freeReplyObject(rr);
	}

/*
typedef struct redisReply {
    int type; REDIS_REPLY
    long long integer; The integer when type is REDIS_REPLY_INTEGER
    int len; Length of string
    char *str; Used for both REDIS_REPLY_ERROR and REDIS_REPLY_STRING
    size_t elements; number of elements, for REDIS_REPLY_ARRAY
    struct redisReply **element; elements vector for REDIS_REPLY_ARRAY
} redisReply;
*/

	redisFree(sub);
	redisFree(pub);

	return 0;
}
