## Defaults to $ENV{REDIS_SERVER} or 127.0.0.1:6379

# http://search.cpan.org/~melo/Redis-1.961/lib/Redis.pm#subscribe
use Redis;
use Data::Dumper;

my $redis = Redis->new;
my $redis = Redis->new(server => '127.0.0.1:6379');
my $redis = Redis->new(reconnect => 60);
my $redis = Redis->new(reconnect => 2, every => 100);
my $redis = Redis->new(encoding => undef);

my $pub = Redis->new;
my $pub = Redis->new(server => '127.0.0.1:6379');
my $pub = Redis->new(reconnect => 60);
my $pub = Redis->new(reconnect => 2, every => 100);
my $pub = Redis->new(encoding => undef);

## Publish/Subscribe
	$redis->subscribe(
      'dbot:eval',
      'dbot:perl',
      sub {
        my ($message, $topic, $subscribed_topic) = @_;
          ## $subscribed_topic can be different from topic if
          ## you use psubscribe() with wildcards
#		print "$message $topic $subscribed_topic\n";

		my $hash = {};
		my $m = $message;
		$m =~ /(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*):(.*)/;
		$hash {'pipeline'} = $1;
		$hash {'expression'} = $2;
		$hash {'type'} = $3;
		$hash {'opts'} = $4;
		$hash {'ts_user'} = $5;
		$hash {'ts_sys'} = $6;
		$hash {'tunnel'} = $7;
		$hash {'listener'} = $8;
		$hash {'from'} = $9;
		$hash {'to'} = $10;
		$hash {'cmd'} = $11;

#		print Dumper(\%hash);

		my $reply = $hash{'pipeline'} . ":" . $hash{'expression'} . ":" . $hash{'type'} . ":" . "null:0:0:" . $hash{'tunnel'} . ":" . $hash{'listener'} . ":" . $hash{'from'} . ":" . $hash{'to'} . ":";

		if($hash{'cmd'} eq '["vping"]') {
			$reply = $reply . "perl";
			$pub->publish('dbot:reply', $reply);
		}
      }
    );


$redis->wait_for_messages(0) while 1;

#$redis->publish('dbot:eval', 'hi');
