module Darkness.Listeners.Triggers.ServiceMain (
  serviceMain
) where



import           Database.Persist.Sqlite            (runSqlPool)
import           Network.Wai.Handler.Warp           (run)
import           System.Environment                 (lookupEnv)

import           Darkness.Listeners.Triggers.Api    (app)
import           Darkness.Listeners.Triggers.Config (Config (..),
                                                     Environment (..),
                                                     defaultConfig, makePool,
                                                     setLogger,
                                                     triggersServiceDbPath,
                                                     triggersServicePort)
import           Darkness.Listeners.Triggers.Models (doMigrations)



serviceMain :: IO ()
serviceMain = do
    env  <- lookupSetting "ENV" Development
    port <- lookupSetting "PORT" triggersServicePort
    path <- lookupSetting "TRIGGERS_DB_PATH" triggersServiceDbPath
    pool <- makePool env
    let
      cfg    = defaultConfig { getPool = pool, getEnv = env, getDb = path }
      logger = setLogger env
    runSqlPool doMigrations pool
    run port $ logger $ app cfg



lookupSetting :: Read a => String -> a -> IO a
lookupSetting env def = do
    p <- lookupEnv env
    return $
      case p of
        Nothing -> def
        Just a  -> read a
