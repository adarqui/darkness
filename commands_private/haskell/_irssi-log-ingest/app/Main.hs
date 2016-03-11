module Main where



import Control.Monad
import System.Exit
import System.Environment
import qualified Data.Text as T
import qualified Data.Text.IO as T
import System.IO

import           Darkness.Commands.Private.Irssi.Ingest



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
      mapM_ ingest argv
