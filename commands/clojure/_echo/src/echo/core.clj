(ns echo.core
  (:gen-class))

(defn -main
  "echo: echos command line arguments"
  [& args]
  (dorun (map println *command-line-args*)))
