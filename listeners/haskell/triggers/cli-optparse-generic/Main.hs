{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}

import           Options.Generic
import           Data.Text (Text)
import Data.Monoid

import           Darkness.Listeners.Triggers

data CliCommands
--  = GetTriggers
--  = GetNsTriggers Text
  = GetNsTrigger Text Text
--  = CreateTrigger Text Text Text Text (Maybe Text)
--  | DeleteTrigger Text
  deriving (Eq, Show, Generic)

instance ParseRecord CliCommands

main = do
  cli <- getRecord "Triggers CLI"
  runCli (cli :: CliCommands)

runCli :: CliCommands -> IO ()
-- runCli GetTriggers = runClientGetTriggers >>= print'
-- runCli (GetNsTriggers ns) = runClientGetNsTriggers ns >>= print'
runCli (GetNsTrigger ns key) = runClientGetNsTrigger ns key >>= print'
-- runCli (CreateTrigger ns key value author author_meta) = runClientCreateTrigger (TriggerRequest author author_meta ns key value) >>= print'
--  triggers <- clientGetTriggers

print' :: (Show a) => Either String a -> IO ()
print' (Left err) = putStrLn $ "Error: " <> err
print' (Right a)  = putStrLn $ show a
