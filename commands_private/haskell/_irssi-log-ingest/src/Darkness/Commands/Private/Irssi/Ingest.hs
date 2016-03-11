{-# LANGUAGE OverloadedStrings #-}

module Darkness.Commands.Private.Irssi.Ingest (
  ingestTriggers
) where



import           Control.Exception            (SomeException, try)
import           Data.Monoid                  ((<>))
import qualified Data.Text                    as T (breakOn, drop, takeWhile,
                                                    uncons)
import qualified Data.Text.IO                 as T (putStrLn)
import           Data.Time                    (UTCTime)

import           Parser.Irssi.Log.Types
import           Parser.Irssi.Log.Util.Import

import           Darkness.Listeners.Triggers



ingestTriggers :: FilePath -> IO ()
ingestTriggers path = do
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
  try (runClientGetTriggerAuthored "efnet_jumping" key nick) :: IO (Either SomeException (Either String TriggerResponse))
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
