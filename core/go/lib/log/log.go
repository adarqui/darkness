package darkness_log

import (
  "os"
  "github.com/op/go-logging"
)

var Log = logging.MustGetLogger("dark_go_relay")

var format = logging.MustStringFormatter(`%{color}%{time:15:04:05.000} %{shortfunc} ▶ %{level:.8s} %{id:08d}%{color:reset} %{message}`)

func InitLog() {
  backend1 := logging.NewLogBackend(os.Stderr, "", 0)
  backend2 := logging.NewLogBackend(os.Stderr, "", 0)

  backend2Formatter := logging.NewBackendFormatter(backend2, format)

  backend1Leveled := logging.AddModuleLevel(backend1)
  backend1Leveled.SetLevel(logging.ERROR, "")

  logging.SetBackend(backend1Leveled, backend2Formatter)
}
