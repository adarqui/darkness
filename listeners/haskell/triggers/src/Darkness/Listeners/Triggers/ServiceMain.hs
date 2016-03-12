module Darkness.Listeners.Triggers.ServiceMain (
  serviceMain
) where



import           Database.Persist.Sqlite            (runSqlPool)
import           Network.Wai.Handler.Warp           (run)

import           Darkness.Listeners.Triggers.Api    (app)
import           Darkness.Listeners.Triggers.Config (Config (..), publicConfigToInternalConfig,
                                                     readPublicConfig,
                                                     setLogger)
import           Darkness.Listeners.Triggers.Models (doMigrations)



serviceMain :: FilePath -> IO ()
serviceMain config_path = do

    public_config <- readPublicConfig config_path
    cfg <- publicConfigToInternalConfig public_config
    putStrLn $ configDb cfg

    let
      logger = setLogger (configEnv cfg)

    runSqlPool doMigrations (configPool cfg)
    run (configPort cfg) $ logger $ app cfg
