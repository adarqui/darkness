<?php

class Ping extends Module {
	public $name = "ping";

	public $triggers = array("ping", "vping");

	public function trigger($args) {

        if($args[0] == "ping") { return $this->_ping($args); }
        else if($args[0] == "vping") { return $this->_vping($args); }

	}

	public function _ping($args) {
		return "pong";
	}
	public function _vping($args) {
		return "php";
	}
}


$ping = new Ping();

return $ping;
