package darkness_config

import (
  "encoding/json"
  "os"
)


// TODO: support yaml & other config file types, modularize these functions since they are repetitive, etc.


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



func ParseIrcConnectedConfig(path string) (IrcConnectedConfig, error) {
  irc_connected_config := IrcConnectedConfig{}

  conf, err := os.Open(path)
  if err != nil {
    return irc_connected_config, err
  }

  json_parser := json.NewDecoder(conf)
  err = json_parser.Decode(&irc_connected_config)
  if err != nil {
    return irc_connected_config, err
  }

  return irc_connected_config, nil
}



func ParseRedisFileConfig(path string) (RedisFileConfig, error) {
  redis_file_config := RedisFileConfig{}

  conf, err := os.Open(path)
  if err != nil {
    return redis_file_config, err
  }

  json_parser := json.NewDecoder(conf)
  err = json_parser.Decode(&redis_file_config)
  if err != nil {
    return redis_file_config, err
  }

  return redis_file_config, nil
}
