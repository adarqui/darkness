{-# LANGUAGE OverloadedStrings #-}

module Darkness.Listeners.Triggers.Config where



import           Control.Monad.Logger                 (runNoLoggingT,
                                                       runStdoutLoggingT)
import           Data.Text                            (Text)
import           Network.Wai                          (Middleware)
import           Network.Wai.Middleware.RequestLogger (logStdout, logStdoutDev)

import           Database.Persist.Sqlite              (ConnectionPool,
                                                       createSqlitePool)



data Config = Config {
    getPool :: ConnectionPool
  , getEnv  :: Environment
  , getDb   :: FilePath
}



data Environment =
    Development
  | Test
  | Production
  deriving (Eq, Show, Read)



defaultConfig :: Config
defaultConfig = Config {
    getPool = undefined
  , getEnv  = Development
  , getDb   = undefined
}



setLogger :: Environment -> Middleware
setLogger Test = id
setLogger Development = logStdoutDev
setLogger Production = logStdout



makePool :: Environment -> IO ConnectionPool
makePool Test = runNoLoggingT $ createSqlitePool (connStr Test) (envPool Test)
makePool e = runStdoutLoggingT $ createSqlitePool (connStr e) (envPool e)



envPool :: Environment -> Int
envPool Test = 1
envPool Development = 1
envPool Production = 8



-- connStr :: Environment -> ConnectionString
connStr :: Environment -> Text
connStr _ = "/tmp/test.db"



triggersServiceHost :: String
triggersServiceHost = "localhost"



triggersServicePort :: Int
triggersServicePort = 65401



triggersServiceDbPath :: FilePath
triggersServiceDbPath = "/tmp/triggers.db"
