module Main where



import           Control.Monad                          (mapM)
import           System.Environment                     (getArgs)
import           System.Exit                            (ExitCode (..),
                                                         exitWith)

import           Darkness.Commands.Private.Irssi.Ingest (ingestTriggers)



usage :: IO ()
usage = do
  putStrLn "usage: irssi-log-ingest irssi1.log irssi2.log ... irssiN.log"
  exitWith (ExitFailure 1)



main :: IO ()
main = do
  argv <- getArgs
  case argv of
    [] -> usage
    _  -> do
      mapM_ ingestTriggers argv
