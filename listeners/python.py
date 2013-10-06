# pip install redis
# https://github.com/andymccurdy/redis-py/blob/master/tests/test_pubsub.py
# https://github.com/andymccurdy/redis-py


import redis
import string
from types import *

# http://docs.python.org/2/tutorial/classes.html
class Message:
	msg = {}
	result = False
	original = ""
	def __init__(self,m):
		# http://docs.python.org/2/library/types.html
		if type(m) is not StringType:
			return
		self.original = m
		self.parse(m)
	def parse(self,m):
		# http://docs.python.org/2/library/string.html
		parsed_string = str.split(m, ":", 11)
		self.msg['pipeline'] = parsed_string[0]
		self.msg['expression'] = parsed_string[1]
		self.msg['type'] = parsed_string[2]
		self.msg['opts'] = parsed_string[3]
		self.msg['ts_user'] = parsed_string[4]
		self.msg['ts_sys'] = parsed_string[5]
		self.msg['listener'] = parsed_string[6]
		self.msg['tunnel'] = parsed_string[7]
		self.msg['from'] = parsed_string[8]
		self.msg['to'] = parsed_string[9]
		self.msg['cmd'] = parsed_string[10]

		#print (parsed_string, "\n", self.msg)

		if self.msg['cmd'] == '["vping"]':
			self.fill("python")

	def fill(self,response):
		self.result = self.msg['pipeline'] + ":" + self.msg['expression'] + ":" + self.msg['type'] + ':null:0:0:' + self.msg['tunnel'] + ":" + self.msg['listener'] + ":" + self.msg['from'] + ":" + self.msg['to'] + ":" + response





# ----
# main
# ----


pub = redis.StrictRedis(host='127.0.0.1', port=6379, db=0)

r = redis.Redis(host='127.0.0.1', port=6379, db=0)
p = r.pubsub()
p.subscribe(['dbot:eval','dbot:python'])
while True:
	x = next(p.listen())

	# http://docs.python.org/2/tutorial/datastructures.html
	message = Message(x['data'])
	if message.result is not False:
		pub.publish('dbot:reply', message.result)	
