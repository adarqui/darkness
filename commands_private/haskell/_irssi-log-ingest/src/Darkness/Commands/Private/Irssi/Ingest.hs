{-# LANGUAGE OverloadedStrings #-}

module Darkness.Commands.Private.Irssi.Ingest (
  ingestTriggers
) where



import           Control.Exception            (SomeException, try)
import           Control.Monad                (void)
import           Control.Monad.IO.Class       (liftIO)
import           Control.Monad.Trans.State    (StateT, evalStateT, gets, put, modify)
import           Data.Monoid                  ((<>))
import           Data.Text                    (Text)
import qualified Data.Text                    as T (breakOn, drop, takeWhile,
                                                    uncons)
import qualified Data.Text.IO                 as T (putStrLn)
import           Data.Time                    (UTCTime)

import           Parser.Irssi.Log.Types
import           Parser.Irssi.Log.Util.Import

import           Darkness.Listeners.Triggers



type Namespace = Text



data TriggerState = TriggerState {
    stCurrentQueryTrigger :: Maybe (Nickname, MessageContent, UTCTime)
  , stNamespace :: Namespace
} deriving (Eq, Show)



defaultTriggerState :: TriggerState
defaultTriggerState = TriggerState {
    stCurrentQueryTrigger = Nothing
  , stNamespace = "unknown"
}



ingestTriggers :: Namespace -> FilePath -> IO ()
ingestTriggers ns path = do
  logs <- importIrssiData path
  evalStateT (mapM parseLine logs) (TriggerState Nothing ns)
  return ()



parseLine :: LogEntry -> StateT TriggerState IO ()
parseLine entry@(ts, log_type) = do
  case log_type of
    (Message _ _ _ _) -> parseMessage entry
    _ -> return ()



parseMessage :: LogEntry -> StateT TriggerState IO ()
parseMessage (ts, Message offset mode nick content) = do

  trig <- gets stCurrentQueryTrigger
  ns   <- gets stNamespace

  case trig of
    -- If currentTriggerQuery is Nothing, then we attempt to parse this message for trigger query/creation
    Nothing -> parseTrigger (ts, Message offset mode nick content)

    -- Here we are told that a previous query returned 404, so, we rely on the idea that the very next
    -- line is perhaps the trigger response from the bot. This way we can add triggers that were added
    -- prior to 2011, which we don't have in the logs.
    (Just (nick, key, ts')) -> do
      liftIO (
        try
          (runClientCreateTrigger (TriggerRequest nick Nothing ns key content) (Just ts)) :: IO (Either SomeException (Either String TriggerResponse)))
      modify (\st -> st { stCurrentQueryTrigger = Nothing })



parseTrigger :: LogEntry -> StateT TriggerState IO ()
parseTrigger (ts, Message offset mode nick content) = do

  case un of
    Nothing -> return ()
    (Just ('`', rest)) -> parseTriggerAccess ts nick rest
    (Just ('+', rest)) -> parseTriggerCreation ts nick (T.drop 1 rest)
    (Just (_, _)) -> return ()

  where
  un = T.uncons content



parseTriggerAccess :: UTCTime -> Nickname -> MessageContent -> StateT TriggerState IO ()
parseTriggerAccess ts nick content = do

  ns <- gets stNamespace

  liftIO $ T.putStrLn $ nick <> " accessed trigger " <> key

  result <- liftIO (
    try (
      runClientGetTrigger ns key (Just nick) (Just ts)) :: IO (Either SomeException (Either String TriggerResponse)))

  case result of
    (Left e) -> liftIO $ putStrLn "error"
    (Right v) -> do
      case v of
        (Left _) -> do
          modify (\st -> st { stCurrentQueryTrigger = Just (nick, key, ts) })
          liftIO $ putStrLn "404"
        (Right _) -> liftIO $ putStrLn "added"

  where
  key = T.takeWhile (/= ' ') content



parseTriggerCreation :: UTCTime -> Nickname -> MessageContent -> StateT TriggerState IO ()
parseTriggerCreation ts nick content = do

  ns <- gets stNamespace

  liftIO $ T.putStrLn $ nick <> " added trigger " <> key <> " with content " <> value

  void $ liftIO (
    try
      (runClientCreateTrigger (TriggerRequest nick Nothing ns key value) (Just ts)) :: IO (Either SomeException (Either String TriggerResponse)))

  where
  (key, value') = T.breakOn " " content
  value = T.drop 1 value'
