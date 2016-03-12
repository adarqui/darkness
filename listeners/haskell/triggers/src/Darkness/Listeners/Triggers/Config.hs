{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RecordWildCards   #-}

module Darkness.Listeners.Triggers.Config where



import           Control.Monad                        (mzero)
import           Control.Monad.Logger                 (runNoLoggingT,
                                                       runStdoutLoggingT)
import           Data.Aeson
import qualified Data.ByteString.Lazy.Char8           as BSLC
import           Data.Monoid                          ((<>))
import qualified Data.Text                            as T (pack)
import           Network.Wai                          (Middleware)
import           Network.Wai.Middleware.RequestLogger (logStdout, logStdoutDev)
import           System.Environment                   (lookupEnv)

import           Database.Persist.Sqlite              (ConnectionPool,
                                                       createSqlitePool)



data PublicConfig = PublicConfig {
    publicConfigHost :: String
  , publicConfigPort :: Int
  , publicConfigEnv  :: Environment
  , publicConfigDb   :: FilePath
}



instance FromJSON PublicConfig where
  parseJSON (Object o) = PublicConfig
    <$> o .: "host"
    <*> o .: "port"
    <*> o .: "env"
    <*> o .: "db"
  parseJSON _ = mzero



data Config = Config {
    configPool       :: ConnectionPool
  , configDataPrefix :: FilePath
  , configHost       :: String
  , configPort       :: Int
  , configEnv        :: Environment
  , configDb         :: FilePath
}



data Environment =
    Development
  | Test
  | Production



instance FromJSON Environment where
  parseJSON (String "development") = pure Development
  parseJSON (String "test")        = pure Test
  parseJSON (String "production")  = pure Production
  parseJSON _ = mzero



defaultPublicConfig :: PublicConfig
defaultPublicConfig = PublicConfig {
    publicConfigHost = triggersServiceHost
  , publicConfigPort = triggersServicePort
  , publicConfigEnv  = triggersServiceEnv
  , publicConfigDb   = triggersServiceDb
}



publicConfigToInternalConfig :: PublicConfig -> IO Config
publicConfigToInternalConfig PublicConfig{..} = do
  dark_data <- lookupSetting "DARK_DATA" "/tmp"
  pool <- (case publicConfigEnv of
    Test -> runNoLoggingT $ createSqlitePool (T.pack publicConfigDb) (envPool Test)
    e    -> runStdoutLoggingT $ createSqlitePool (T.pack publicConfigDb) (envPool e))
  return $ Config pool dark_data publicConfigHost publicConfigPort publicConfigEnv (dark_data <> "/" <> publicConfigDb)



-- too lazy to parse error types right now
readPublicConfig :: FilePath -> IO PublicConfig
readPublicConfig config_path = do
  v <- eitherDecode <$> BSLC.readFile config_path
  case v of
    (Left err) -> error err
    (Right v') -> pure v'



setLogger :: Environment -> Middleware
setLogger Test = id
setLogger Development = logStdoutDev
setLogger Production = logStdout




envPool :: Environment -> Int
envPool Test = 1
envPool Development = 1
envPool Production = 8



lookupSetting :: Read a => String -> a -> IO a
lookupSetting env def = do
    p <- lookupEnv env
    return $
      case p of
        Nothing -> def
        Just a  -> read a



triggersServiceHost :: String
triggersServiceHost = "localhost"



triggersServicePort :: Int
triggersServicePort = 65401



triggersServiceEnv :: Environment
triggersServiceEnv = Development



triggersServiceDb :: FilePath
triggersServiceDb = "test.db"
