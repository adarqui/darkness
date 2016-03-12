module Main where



import           System.Environment          (getArgs)
import           System.Exit                 (ExitCode (..), exitWith)

import           Darkness.Listeners.Triggers (serviceMain)



usage :: IO ()
usage = do
  putStrLn "usage: dark-listener-haskell-triggers <config_file.json>"
  exitWith $ ExitFailure 1



main :: IO ()
main = do
  argv <- getArgs
  case argv of
    (config_path:[]) -> serviceMain config_path
    _ -> usage
