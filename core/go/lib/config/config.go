package darkness_config

import (
	"encoding/json"
	"os"
)

func ParseConfig(path string) (FrontConfig, error) {
	front_config := FrontConfig{}

	conf, err := os.Open(path)
	if err != nil {
		return front_config, err
	}

	json_parser := json.NewDecoder(conf)
	err = json_parser.Decode(&front_config)
	if err != nil {
		return front_config, err
	}

	return front_config, nil
}
