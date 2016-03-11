{-# LANGUAGE OverloadedStrings #-}

module Darkness.Commands.Private.Irssi.Ingest (
  ingest
) where



import Control.Monad
import Control.Exception
import qualified Data.Text as T
import qualified Data.Text.IO as T
import Data.Monoid ((<>))
import Data.Time (UTCTime)

import Parser.Irssi.Log.Types
import Parser.Irssi.Log.Util.Import

import Darkness.Listeners.Triggers



ingest :: FilePath -> IO ()
ingest path = do
  logs <- importIrssiData path
  mapM parseLine logs
  return ()



parseLine :: LogEntry -> IO ()
parseLine entry@(ts, log_type) = do
  case log_type of
    (Message _ _ _ _) -> parseMessage entry
    _ -> return ()



parseMessage :: LogEntry -> IO ()
parseMessage (ts, Message offset mode nick content) = do
  case un of
    Nothing -> return ()
    (Just ('`', rest)) -> parseTriggerAccess ts nick rest
    (Just ('+', rest)) -> parseTriggerCreation ts nick (T.drop 1 rest)
    (Just (_, _)) -> return ()
  where
  un = T.uncons content



parseTriggerAccess :: UTCTime -> Nickname -> MessageContent -> IO ()
parseTriggerAccess ts nick content = do
  T.putStrLn $ nick <> " accessed trigger " <> key
  try (runClientGetTrigger "efnet_jumping" key) :: IO (Either SomeException (Either String TriggerResponse))
  return ()
  where
  key = T.takeWhile (/= ' ') content



parseTriggerCreation :: UTCTime -> Nickname -> MessageContent -> IO ()
parseTriggerCreation ts nick content = do
  T.putStrLn $ nick <> " added trigger " <> key <> " with content " <> value
  try (runClientCreateTrigger $ TriggerRequest nick Nothing "efnet_jumping" key value) :: IO (Either SomeException (Either String TriggerResponse))
  return ()
  where
  (key, value') = T.breakOn " " content
  value = T.drop 1 value'
