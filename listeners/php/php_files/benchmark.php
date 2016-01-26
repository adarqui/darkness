<?php

class Benchmark extends Module {
	public $name = "benchmark";

	public $triggers = array("benchmark");

	public $sub_triggers = array();

	public function __construct() {
		$this->sub_triggers['randloop'] = array('Benchmark', '_randloop');
		$this->sub_triggers['readurandom'] = array('Benchmark', '_readurandom');

//call_user_func($sub_triggers['randloop'], "hi");
print_r ($sub_triggers);
//exit;
	}

	public function trigger($args) {

//echo "trigger called with ";
//print_r ($args);

        if($args[0] == "benchmark") { return $this->_benchmark($args); }

		return "";
	}

	public function _benchmark($args) {

//print_r ($args);


$cnt = count($args);


if($cnt < 2) return "error";


call_user_func($this->sub_triggers[$args[1]], $args);

		return $cnt;
	}

	public function _randloop($args) {
# http://www.php.net/manual/en/function.openssl-random-pseudo-bytes.php

$loop_cnt = $args[2];
//echo $loop_cnt . "\n";

		for($v = 0 ; $v < $loop_cnt ; $v++) {
//			echo "ghi\n";
			rand();
		}

		return "randloop " . $loop_cnt;
	}

	public function _readurandom($args) {
		$len = $args[2];

//echo "readurandom!!!!!!!!!!";
		$str = file_get_contents("/dev/urandom", NULL, NULL, 0, $len);

		return "readurandom,php";
	}
}


$benchmark = new Benchmark();

return $benchmark;
