{-# LANGUAGE DeriveGeneric              #-}
{-# LANGUAGE EmptyDataDecls             #-}
{-# LANGUAGE FlexibleContexts           #-}
{-# LANGUAGE GADTs                      #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE MultiParamTypeClasses      #-}
{-# LANGUAGE OverloadedStrings          #-}
{-# LANGUAGE QuasiQuotes                #-}
{-# LANGUAGE RecordWildCards            #-}
{-# LANGUAGE TemplateHaskell            #-}
{-# LANGUAGE TypeFamilies               #-}
{-# LANGUAGE RankNTypes #-}

module Darkness.Listeners.Triggers.Models where



import           Control.Monad.Reader               (ReaderT, asks, liftIO)
import           Data.Aeson                         ()
import           Data.Text                          (Text)
import           Data.Time                          (UTCTime)
import           Data.Typeable                      (Typeable)
import           Database.Persist.Sqlite            (SqlBackend (..),
                                                     runMigration, runSqlPool)
import           GHC.Generics                       ()
import           Database.Persist.TH                (mkMigrate, mkPersist,
                                                     persistLowerCase, share,
                                                     sqlSettings)

import           Darkness.Listeners.Triggers.Config
import           Darkness.Listeners.Triggers.Types  (TriggerRequest (..),
                                                     TriggerResponse (..))



share [mkPersist sqlSettings, mkMigrate "migrateAll"] [persistLowerCase|
Trigger
  author         Text
  authorMeta     Text Maybe
  namespace      Text
  key            Text
  value          Text
  counter        Int
  createdAt      UTCTime DEFAULT=now()
  modifiedAt     UTCTime
  lastAccessedAt UTCTime
  UniqueTrigger  namespace key
  deriving       Eq Show Typeable
|]



doMigrations :: ReaderT SqlBackend IO ()
doMigrations = runMigration migrateAll



-- runDb :: forall (m :: * -> *) b. (MonadIO m, Config m) => SqlPersistT IO b -> m b
runDb query = do
    pool <- asks getPool
    liftIO $ runSqlPool query pool



triggerToTriggerRequest :: Trigger -> TriggerRequest
triggerToTriggerRequest Trigger{..} = TriggerRequest {
  triggerRequestAuthor = triggerAuthor,
  triggerRequestAuthorMeta = triggerAuthorMeta,
  triggerRequestNamespace = triggerNamespace,
  triggerRequestKey = triggerKey,
  triggerRequestValue = triggerValue
}



triggerRequestToTrigger :: TriggerRequest -> Int -> UTCTime -> UTCTime -> UTCTime -> Trigger
triggerRequestToTrigger TriggerRequest{..} counter created modified accessed =
  Trigger
    triggerRequestAuthor
    triggerRequestAuthorMeta
    triggerRequestNamespace
    triggerRequestKey
    triggerRequestValue
    counter
    created
    modified
    accessed



triggerToTriggerResponse :: Trigger -> TriggerResponse
triggerToTriggerResponse Trigger{..} = TriggerResponse {
  triggerResponseAuthor = triggerAuthor,
  triggerResponseAuthorMeta = triggerAuthorMeta,
  triggerResponseNamespace = triggerNamespace,
  triggerResponseKey = triggerKey,
  triggerResponseValue = triggerValue,
  triggerResponseCounter = triggerCounter,
  triggerResponseCreatedAt = triggerCreatedAt,
  triggerResponseModifiedAt = triggerModifiedAt,
  triggerResponseLastAccessedAt = triggerLastAccessedAt
}
