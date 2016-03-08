module Main where

import           Darkness.Commands.Private.LOC (countLinesOfFiles,
                                                findFilesBySuffix)
import           System.Environment            (getArgs)



usage :: IO ()
usage = do
  putStrLn $
    unlines
      [
        "usage: loc <directory> <file_extension_1> ... <file_extension_n"
      , "ex: loc ./ .hs .c .purs"
      ]



main :: IO ()
main = do
  argv <- getArgs
  case argv of
    (directory:file_extensions) -> findFilesBySuffix file_extensions directory >>= countLinesOfFiles >>= putStrLn . show
    _ -> usage
