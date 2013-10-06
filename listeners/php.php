<?php

/* read error issues: https://github.com/nicolasff/phpredis/issues/70 */

function stringEndsWith($whole, $end)
{
    return (strpos($whole, $end, strlen($whole) - strlen($end)) !== false);
}


class Module {
	public function __construct() {
		echo "module $this->name\n";
	}
	public function trigger($args) {
		return "noop";
	}
	public function getTriggers() {
		return $this->triggers;
	}
	public function getName() {
		return $this->name;
	}
}

class Modules {
	public $modules = array();
	public $triggers = array();

	public function __construct() {
		$this->__loadAll();
	}

	public function addModule($mod) {
		$modules[$mod->getName()] = $mod;	

		foreach($mod->getTriggers() as $value) {
			$this->triggers[$value] = $mod;
		}
	}

	public function __loadAll() {
// http://php.net/manual/en/function.readdir.php
		if($handle = opendir("./php_files/")) {
			while(false !== ($ent = readdir($handle))) {

				if(strstr($ent, ".swp")) { continue; }
				if(!strstr($ent, ".php")) { continue; }

				$mod = include('./php_files/'.$ent);

				echo "included module: " . $mod->getName() . "\n";
				
				$this->addModule($mod);
			}
		}
	}
}


class Message {

	// http://php.net/manual/en/language.oop5.php

/*
stimuli:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<STIMULI:JSON>
response:
    <pipeline>:<expression>:<type>:<options>:<ts-u-cmd-diff>:<ts-s-cmd-diff>:<tunnel>:<listener>:<from>:<to>:<RESPONSE:STRING>
*/

	public $pipeline;
	public $expression;
	public $type;
	public $options;
	public $ts_u;
	public $ts_s;
	public $tunnel;
	public $listener;
	public $from;
	public $to;
	public $cmd;

	public $result;

	private $times_begin;
	private $times_end;

	public function __construct($str) {
		$this->parseMessage($str);
	}

	public function parseMessage($str) {
	

global $modules;

		// http://php.net/manual/en/function.explode.php
		$parsed_message = explode(":", $str, 11);

		$this->pipeline = $parsed_message[0];
		$this->expression = $parsed_message[1];
		$this->type = $parsed_message[2];
		$this->options = $parsed_message[3];
		$this->ts_u = $parsed_message[4];
		$this->ts_s = $parsed_message[5];
		$this->tunnel = $parsed_message[6];
		$this->from = $parsed_message[8];
		$this->to = $parsed_message[9];

		$this->listener = "php";

		// http://php.net/manual/en/function.json-decode.php
		$parsed_json = json_decode($parsed_message[10]);

			$mod = $modules->triggers[$parsed_json[0]];
			if($mod) {

$this->times_begin = posix_times();
			$response = $mod->trigger($parsed_json);
$this->times_end = posix_times();

		$this->ts_u = $this->times_end['utime'] - $this->times_begin['utime'];
		$this->ts_s = $this->times_end['stime'] - $this->times_begin['stime'];

        $this->result = $this->pipeline . ":" . $this->expression . ":" . $this->type . ":" . $this->options . ":" . $this->ts_u . ":" . $this->ts_s . ":" . $this->tunnel . ":" . $this->listener . ":" . $this->from . ":" . $this->to . ":";

			$this->result = $this->result . $response;



		}
		else {
			$this->result = false;
		}
	}
};


function sub_handler($redis, $chan, $msg) {
	global $pub;
	$message = new Message($msg);
	if($message->result !== false) {
		try {
			$pub->publish('dbot:reply', $message->result);	
		} catch(Exception $e) {
			echo "Error [pub publish]: " . $e->getMessage() . "\n";
		}
	}
}






$modules = new Modules();


$sub = new Redis();

try {
	$sub->connect('127.0.0.1', 6379, 0, NULL, 100);
} catch(Exception $e) {
	echo "Error [sub connect]: " . $e->getMessage() . "\n";
}

$pub = new Redis();

try { 
	$pub->connect('127.0.0.1', 6379);
} catch(Exception $e) {
	echo "Error [pub connect]: " . $e->getMessage() . "\n";
}

echo "Connected!\n";

poopOnMe:
try {
	$sub->subscribe(array('dbot:eval', 'dbot:php'), 'sub_handler');
} catch(Exception $e) {
	echo "Error [sub subscribe]: " . $e->getMessage() . "\n";
	goto poopOnMe;
}
