(ns zargs.core
  (:gen-class))

(defn -main
  "zargs: prints command line arguments with newlines"
  [& args]
  (dorun (map println *command-line-args*)))
