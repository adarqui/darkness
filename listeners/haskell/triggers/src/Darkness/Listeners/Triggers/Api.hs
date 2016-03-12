{-# LANGUAGE DataKinds       #-}
{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE TypeOperators   #-}
{-# LANGUAGE OverloadedStrings #-}

module Darkness.Listeners.Triggers.Api where



import           Control.Monad.IO.Class             (liftIO)
import           Control.Monad.Reader               (ReaderT, lift, runReaderT)
import           Control.Monad.Trans.Either         (EitherT, left)
import           Data.Text                          (Text)
import           Data.Time                          (getCurrentTime)
import           Database.Persist.Postgresql        (Entity (..), deleteWhere,
                                                     get, insert, selectFirst,
                                                     selectList, update,
                                                     updateGet, (+=.), (=.),
                                                     (==.))
import           Network.Wai                        (Application)
import           Servant

import           Darkness.Listeners.Triggers.Config (Config (..))
import           Darkness.Listeners.Triggers.Models
import           Darkness.Listeners.Triggers.Types  (TriggerRequest (..),
                                                     TriggerResponse (..))



type TriggerAPI =
         "triggers" :> Get '[JSON] [TriggerResponse]
    :<|> "triggers" :> Capture "ns" Text :> Get '[JSON] [TriggerResponse]
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> Get '[JSON] TriggerResponse
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> Capture "author" Text :> Get '[JSON] TriggerResponse
    :<|> "triggers" :> ReqBody '[JSON] TriggerRequest :> Post '[JSON] TriggerResponse
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> ReqBody '[JSON] TriggerRequest :> Put '[JSON] TriggerResponse
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> Delete '[JSON] ()



type AppM = ReaderT Config (EitherT ServantErr IO)



triggerAPI :: Proxy TriggerAPI
triggerAPI = Proxy



app :: Config -> Application
app cfg = serve triggerAPI (readerServer cfg)



readerServer :: Config -> Server TriggerAPI
readerServer cfg = enter (readerToEither cfg) server



readerToEither :: Config -> AppM :~> EitherT ServantErr IO
readerToEither cfg = Nat $ \x -> runReaderT x cfg



server :: ServerT TriggerAPI AppM
server = apiGetAllTriggers :<|> apiGetTriggers :<|> apiGetTrigger :<|> apiGetTriggerAuthored :<|> apiCreateTrigger :<|> apiUpdateTrigger :<|> apiDeleteTrigger



apiGetAllTriggers :: AppM [TriggerResponse]
apiGetAllTriggers = do
  triggers <- runDb $ selectList [] []
  let trigger_responses = map (\(Entity _ trigger) -> triggerToTriggerResponse trigger) triggers
  return trigger_responses



apiGetTriggers :: Text -> AppM [TriggerResponse]
apiGetTriggers ns = do
  triggers <- runDb $ selectList [ TriggerNamespace ==. ns ] []
  let trigger_responses = map (\(Entity _ trigger) -> triggerToTriggerResponse trigger) triggers
  return trigger_responses



apiGetTrigger :: Text -> Text -> AppM TriggerResponse
apiGetTrigger ns key = do
  now <- liftIO getCurrentTime
  mtrigger <- runDb $ selectFirst [ TriggerNamespace ==. ns, TriggerKey ==. key ] []
  case mtrigger of
    Nothing -> lift $ left err404
    (Just (Entity trigger_id trigger)) -> do
      runDb $ update trigger_id [ TriggerCounter +=. 1, TriggerLastAccessedAt =. now ]
      return $ triggerToTriggerResponse trigger



-- | This hacked up function was created for ingesting my irssi logs.
-- It creates a trigger if someone tries to access it and it doesn't exist..
-- Now we just need to be able to override
--
apiGetTriggerAuthored :: Text -> Text -> Text -> AppM TriggerResponse
apiGetTriggerAuthored ns key author = do
  now <- liftIO getCurrentTime
  mtrigger <- runDb $ selectFirst [ TriggerNamespace ==. ns, TriggerKey ==. key ] []
  case mtrigger of
    Nothing -> do
      -- lets create it anyway? missing table..
      -- apiCreateTrigger $ TriggerRequest author (Just "not_found") ns key ""
      lift $ left err404
    (Just (Entity trigger_id trigger)) -> do
      runDb $ update trigger_id [ TriggerCounter +=. 1, TriggerLastAccessedAt =. now ]
      runDb $ insert $ TriggerAccessHistory trigger_id author Nothing ns key now
      return $ triggerToTriggerResponse trigger



apiCreateTrigger :: TriggerRequest -> AppM TriggerResponse
apiCreateTrigger trigger_request = do
  now <- liftIO getCurrentTime
  trigger_key <- runDb $ insert $ triggerRequestToTrigger trigger_request 0 now now now
  mtrigger <- runDb $ get trigger_key
  case mtrigger of
    Nothing -> lift $ left err404
    (Just trigger) -> return $ triggerToTriggerResponse trigger



apiUpdateTrigger :: Text -> Text -> TriggerRequest -> AppM TriggerResponse
apiUpdateTrigger ns key TriggerRequest{..} = do
  now <- liftIO getCurrentTime
  mtrigger <- runDb $ selectFirst [ TriggerNamespace ==. ns, TriggerKey ==. key ] []
  case mtrigger of
    Nothing -> lift $ left err404
    (Just (Entity trigger_id _)) -> do
      trigger' <- runDb $ updateGet trigger_id [
          TriggerAuthor =. triggerRequestAuthor,
          TriggerAuthorMeta =. triggerRequestAuthorMeta,
          TriggerNamespace =. triggerRequestNamespace,
          TriggerKey =. triggerRequestKey,
          TriggerValue =. triggerRequestValue,
          TriggerModifiedAt =. now
        ]
      return $ triggerToTriggerResponse trigger'



apiDeleteTrigger :: Text -> Text -> AppM ()
apiDeleteTrigger ns key = do
  runDb $ deleteWhere [ TriggerNamespace ==. ns, TriggerKey ==. key ]
