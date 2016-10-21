module Main where



import Data.Monoid
import           Data.List
import           Data.Quantities
import qualified Data.Quantities    as Quantities
import           System.Environment
import System.Exit



usage :: IO ()
usage = do
  putStrLn "usage: units <some unit conversion>"
  exitWith $ ExitFailure 1



main :: IO ()
main = do
  argv <- getArgs
  case argv of
    [] -> usage
    xs -> do
      let lr = Quantities.fromString $ intercalate " " xs
      case lr of
        Left err -> do
          putStrLn $ "Error: " <> (show err)
          exitWith $ ExitFailure 1
        Right v  -> do
          putStrLn $ show v
          exitWith ExitSuccess
