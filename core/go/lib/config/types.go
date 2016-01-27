package darkness_config

type FrontConfig struct {
	Author  AuthorConfig      `json:"author"`
	Net     NetConfig         `json:"net"`
	Servers map[string]IrcServerConfig `json:"servers"`
}

type AuthorConfig struct {
	Name    string            `json:"name"`
}

type NetConfig struct {
	NetBind string `json:"host"`
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
