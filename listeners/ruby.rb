# https://github.com/redis/redis-rb
# https://github.com/redis/redis-rb/blob/master/test/publish_subscribe_test.rb

# http://www.ruby-doc.org/docs/ProgrammingRuby/html/tut_modules.html
$:.unshift File.join('ruby_libs/redis-rb',File.dirname(__FILE__), 'lib')
require "redis"



# http://www.ruby-doc.org/core-2.0.0/Class.html
class Message

	@split

	def pipeline arg
		@pipeline = arg
	end

	def expression arg
		@expression = arg
	end

	def type arg
		@type = arg
	end

	def opts arg
		@opts = arg
	end

	def ts_user arg
		@ts_user = arg
	end

	def ts_sys arg
		@ts_sys = arg
	end

	def tunnel arg
		@tunnel = arg
	end

	def listener arg
		@listener = arg
	end

	def from arg
		@from = arg
	end

	def to arg
		@to = arg
	end

	def cmd arg
		@cmd = arg
	end

	def getCmd
		return @cmd
	end

	def split_message message
		@split = message.split(':', 11)
		pipeline @split[0]
		expression @split[1]
		type @split[2]
		opts @split[3]
		ts_user @split[4]
		ts_sys @split[5]
		tunnel @split[6]
		listener @split[7]
		from @split[8]
		to @split[9]
		cmd @split[10]
		
	end	

	def build arg
		return @pipeline + ":" + @expression + ":" + @type + ":null:0:0:" + @tunnel + ":" + @listener + ":" + @from + ":" + @to + ":" + arg
	end


	#def new(*args)
	def initialize(parms)
		split_message parms
	end
	
end


redis = Redis.new(:host => "127.0.0.1", :port => 6379)
pub = Redis.new(:host => "127.0.0.1", :port => 6379)

redis.subscribe(["dbot:eval","dbot:ruby"]) do |on|
	on.message do |channel,message|
#		puts message

		#split_message = message.split(':', 8)
		#puts split_message

		msg = Message.new(message)

		if msg.getCmd.eql? "[\"vping\"]"
			pub.publish("dbot:reply", msg.build("ruby"))	
		end

	end
end
