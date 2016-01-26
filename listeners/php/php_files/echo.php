<?php

class Echox extends Module {
	public $name = "echo";

	public $triggers = array("echo", "e");

	public function trigger($args) {

        if($args[0] == "echo") { return $this->_echo($args); }
        else if($args[0] == "e") { return $this->_e($args); }

	}

	public function _echo($args) {

	$result = "";
	$delim = " ";

foreach($args as $k => $value) {
	if($k == 0) continue;
	if($k == 1) $delim = "";
	else { $delim = " "; }
	$result = $result . $delim . $value;
}

		return $result;
	}
	public function _e($args) {
		return $this->_echo($args);
	}
}


$echo = new Echox();

return $echo;
