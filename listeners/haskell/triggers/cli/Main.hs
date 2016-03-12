{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RecordWildCards   #-}



import           Control.Monad.Reader        (asks)
import           Data.Aeson                  (ToJSON, encode)
import qualified Data.ByteString.Lazy.Char8  as BLC (unpack)
import           Data.Text                   (Text)
import qualified Data.Text                   as T (pack)
import           Data.Time                   (UTCTime)
import           Options.Applicative
import           Options.Applicative.Types

import           Darkness.Listeners.Triggers



type Ns = Text
type Key = Text
type Value = Text
type Author = Text
type AuthorMeta = Text



data OutputMode
  = Human
  | JSON
  deriving (Eq, Show)



data CommandOptions = CommandOptions {
  outputMode :: OutputMode
} deriving (Eq, Show)



data SubCommandOptions
  = GetAllTriggers
  | GetTriggers Ns
  | GetTrigger Ns Key (Maybe Author)
  | CreateTrigger Ns Key Value Author (Maybe AuthorMeta)
  | UpdateTrigger Ns Key Ns Key Value Author (Maybe AuthorMeta)
--  | CreateTriggerHack Ns Key
  | DeleteTrigger Ns Key
  deriving (Eq, Show)



data Options
  = Options CommandOptions SubCommandOptions
  deriving (Eq, Show)



main :: IO ()
main = do
  execParser opts >>= run
  where
  opts = info (helper <*> parseOptions) (fullDesc <> progDesc "CRUD for triggers" <> header "Trigger CLI")



parseOptions :: Parser Options
parseOptions = Options <$> parseCommandOptions <*> parseSubCommandOptions



parseCommandOptions :: Parser CommandOptions
parseCommandOptions = CommandOptions
  <$> (flag Human JSON (long "json") <|> flag JSON Human (long "human"))



parseSubCommandOptions :: Parser SubCommandOptions
parseSubCommandOptions =
  subparser $
    command "get-all-triggers" (info parseSubCommand_GetAllTriggers fullDesc) <>
    command "get-triggers"     (info parseSubCommand_GetTriggers fullDesc)    <>
    command "get-trigger"      (info parseSubCommand_GetTrigger fullDesc)     <>
    command "create-trigger"   (info parseSubCommand_CreateTrigger fullDesc)  <>
    command "update-trigger"   (info parseSubCommand_UpdateTrigger fullDesc)  <>
    command "delete-trigger"   (info parseSubCommand_DeleteTrigger fullDesc)



parseSubCommand_GetAllTriggers :: Parser SubCommandOptions
parseSubCommand_GetAllTriggers = pure GetAllTriggers



parseSubCommand_GetTriggers :: Parser SubCommandOptions
parseSubCommand_GetTriggers = GetTriggers <$> argument text (metavar "NAMESPACE")



parseSubCommand_GetTrigger :: Parser SubCommandOptions
parseSubCommand_GetTrigger = GetTrigger
  <$> argument text (metavar "NAMESPACE")
  <*> argument text (metavar "KEY")
  <*> optional (argument text (metavar "AUTHOR"))



parseSubCommand_CreateTrigger :: Parser SubCommandOptions
parseSubCommand_CreateTrigger =
  CreateTrigger
  <$> argument text (metavar "NAMESPACE")
  <*> argument text (metavar "KEY")
  <*> argument text (metavar "VALUE")
  <*> argument text (metavar "AUTHOR")
  <*> optional (argument text (metavar "AUTHOR_META"))



parseSubCommand_UpdateTrigger :: Parser SubCommandOptions
parseSubCommand_UpdateTrigger =
  UpdateTrigger
  <$> argument text (metavar "ORIGINAL_NAMESPACE")
  <*> argument text (metavar "ORIGINAL_KEY")
  <*> argument text (metavar "NEW_NAMESPACE")
  <*> argument text (metavar "NEW_KEY")
  <*> argument text (metavar "NEW_VALUE")
  <*> argument text (metavar "NEW_AUTHOR")
  <*> optional (argument text (metavar "NEW_AUTHOR_META"))



parseSubCommand_DeleteTrigger :: Parser SubCommandOptions
parseSubCommand_DeleteTrigger = DeleteTrigger <$> argument text (metavar "NAMESPACE") <*> argument text (metavar "KEY")



run :: Options -> IO ()
run (Options CommandOptions{..} sub) = do
  case sub of
    GetAllTriggers         -> runClientGetAllTriggers >>= putJSON
    (GetTriggers ns)       -> runClientGetTriggers ns >>= putJSON
    (GetTrigger ns key author) -> runClientGetTrigger ns key author Nothing >>= putJSON
    (DeleteTrigger ns key) -> runClientDeleteTrigger ns key >>= putJSON
    (CreateTrigger ns key value' author author_meta) -> runClientCreateTrigger (TriggerRequest author author_meta ns key value') Nothing >>= putJSON
    (UpdateTrigger orig_ns orig_key new_ns new_key new_value' new_author new_author_meta) ->
      runClientUpdateTrigger orig_ns orig_key (TriggerRequest new_author new_author_meta new_ns new_key new_value') >>= putJSON



putJSON :: (Show a, ToJSON a) => Either String a -> IO ()
putJSON (Left err) = error $ "Error: " <> err
putJSON (Right a)  = putStrLn $ BLC.unpack $ encode a



-- | similar to 'str', but for Text types.
text :: ReadM Text
text = ReadM (asks T.pack)
