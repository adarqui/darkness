package darkness_config

import (
  "encoding/json"
  "os"
)

func ParseRelayConfig(path string) (RelayConfig, error) {
  relay_config := RelayConfig{}

  conf, err := os.Open(path)
  if err != nil {
    return relay_config, err
  }

  json_parser := json.NewDecoder(conf)
  err = json_parser.Decode(&relay_config)
  if err != nil {
    return relay_config, err
  }

  return relay_config, nil
}
