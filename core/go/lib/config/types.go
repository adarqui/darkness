package darkness_config

type RelayConfig struct {
  Author  AuthorConfig               `json:"author"`
  Redis   RedisConfig                `json:"redis"`
  Net     NetConfig                  `json:"net"`
  Servers []ServerConfig             `json:"servers"`
//  Servers map[string]ServerConfig    `json:"servers"`
//  Servers map[string]IrcServerConfig `json:"servers"`
}

type AuthorConfig struct {
  Name string `json:"name"`
}

type RedisConfig struct {
  RedisHost string `json:"host"`
  RedisPort int    `json:"port"`
}

type NetConfig struct {
  NetHost string `json:"host"`
  NetPort int    `json:"port"`
}

type IrcServerConfig struct {
  Address  string   `json:"address"`
  Port     int      `json:"port"`
  NickName string   `json:"nickName"`
  UserName string   `json:"userName"`
  RealName string   `json:"realName"`
  Channels []string `json:"channels"`
}

type IrcConnectedConfig struct {
  Redis RedisConfig                `json:"redis"`
  Labels map[string]IrcJoinConfig  `json:"labels"`
}

// eventually need to support nick registration, channel keys etc
type IrcJoinConfig struct {
  Nicks    []string `json:"nicks"`
  UserName string   `json:"user_name"`
  UserMode int      `json:"user_mode"`
  RealName string   `json:"real_name"`
  Channels []string `json:"channels"`
}

type ServerConfig struct {
  Session string  `json:"ses,omitempty"`
  Label string    `json:"label"`
  Host string     `json:"host"`
  Port int        `json:"port"`
  Protocol string `json:"protocol"`
}
