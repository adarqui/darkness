(ns argc.core
  (:gen-class))

(defn -main
  "just print the length of our arguments"
  [& args]
  (println (count args)))
