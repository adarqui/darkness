{-# LANGUAGE OverloadedStrings #-}

module Darkness.Commands.Echo (
  EchoOptions (..),
  echoMain,
  echo
) where



import           Data.List          (intersperse)
import           Data.Text          (Text)
import qualified Data.Text          as T (concat, pack)
import qualified Data.Text.IO       as T (putStr, putStrLn)
import           System.Environment (getArgs)



data EchoOptions
  = EchoNL
  | EchoNoNL
  deriving (Eq, Ord, Show, Read)



echoMain :: IO ()
echoMain = do
  argv <- getArgs
  let argv' = map T.pack argv
  case argv' of
    ("-n":xs) -> echo EchoNoNL xs
    _         -> echo EchoNL argv'



echo :: EchoOptions -> [Text] -> IO ()
echo opt argv = do
  case opt of
    EchoNL   -> T.putStrLn argv'
    EchoNoNL -> T.putStr argv'
  where
  argv' = T.concat $ intersperse " " argv
