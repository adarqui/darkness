module Main where

import System.Environment (getArgs)

main :: IO ()
main = getArgs >>= putStrLn . show . length
