package darkness_config

type FrontConfig struct {
  Author  AuthorConfig               `json:"author"`
  Redis   RedisConfig                `json:"redis"`
  Net     NetConfig                  `json:"net"`
  Servers map[string]ServerConfig    `json:"servers"`
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

type ServerConfig struct {
  Label string    `json:"label"`
  Host string     `json:"host"`
  Port int        `json:"port"`
  Protocol string `json:"protocol"`
}
