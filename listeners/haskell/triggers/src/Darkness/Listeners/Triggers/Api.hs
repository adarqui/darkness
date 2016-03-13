{-# LANGUAGE DataKinds         #-}
{-# LANGUAGE InstanceSigs      #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RecordWildCards   #-}
{-# LANGUAGE TypeOperators     #-}

module Darkness.Listeners.Triggers.Api where



import           Control.Monad                      (void)
import           Control.Monad.IO.Class             (liftIO)
import           Control.Monad.Reader               (ReaderT, lift, runReaderT)
import           Control.Monad.Trans.Either         (EitherT, left)
import           Data.Text                          (Text)
import qualified Data.Text                          as T (pack, unpack)
import           Data.Time                          (UTCTime, getCurrentTime)
import qualified Database.Esqueleto                 as E
import           Database.Persist                   (Entity (..), deleteWhere,
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

import           Text.Read                          (readMaybe)


type TriggerAPI =
         "triggers" :> Get '[JSON] [TriggerResponse]
    :<|> "triggers" :> Capture "ns" Text :> Get '[JSON] [TriggerResponse]
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> QueryParam "author" Text :> QueryParam "ts" UTCTime :> Get '[JSON] TriggerResponse
    :<|> "triggers" :> ReqBody '[JSON] TriggerRequest :> QueryParam "ts" UTCTime :> Post '[JSON] TriggerResponse
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> ReqBody '[JSON] TriggerRequest :> Put '[JSON] TriggerResponse
    :<|> "triggers" :> Capture "ns" Text :> Capture "key" Text :> Delete '[JSON] ()
    :<|> "search" :> Capture "ns" Text :> Capture "criteria" Text :> QueryParam "search_by" Text :> QueryParam "limit" Int :> QueryParam "offset" Int :> Get '[JSON] [TriggerResponse]



type AppM = ReaderT Config (EitherT ServantErr IO)



instance FromText UTCTime where
  fromText :: Text -> Maybe UTCTime
  fromText = readMaybe . T.unpack



instance ToText UTCTime where
  toText :: UTCTime -> Text
  toText = T.pack . show



triggerAPI :: Proxy TriggerAPI
triggerAPI = Proxy



app :: Config -> Application
app cfg = serve triggerAPI (readerServer cfg)



readerServer :: Config -> Server TriggerAPI
readerServer cfg = enter (readerToEither cfg) server



readerToEither :: Config -> AppM :~> EitherT ServantErr IO
readerToEither cfg = Nat $ \x -> runReaderT x cfg



server :: ServerT TriggerAPI AppM
server = apiGetAllTriggers :<|> apiGetTriggers :<|> apiGetTrigger :<|> apiCreateTrigger :<|> apiUpdateTrigger :<|> apiDeleteTrigger :<|> apiSearchTriggers



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



apiGetTrigger :: Text -> Text -> Maybe Text -> Maybe UTCTime -> AppM TriggerResponse
apiGetTrigger ns key mauthor mts = do

  now <- case mts of
    Nothing -> liftIO getCurrentTime
    (Just ts) -> return ts

  mtrigger <- runDb $ selectFirst [ TriggerNamespace ==. ns, TriggerKey ==. key ] []
  case mtrigger of
    Nothing -> lift $ left err404
    (Just (Entity trigger_id trigger)) -> do
      runDb $ update trigger_id [ TriggerCounter +=. 1, TriggerLastAccessedAt =. now ]

      case mauthor of
        Nothing -> return ()
        (Just author) -> void $ runDb $ insert $ TriggerAccessHistory trigger_id author Nothing ns key now

      return $ triggerToTriggerResponse trigger



apiCreateTrigger :: TriggerRequest -> Maybe UTCTime -> AppM TriggerResponse
apiCreateTrigger trigger_request mts = do

  now <- case mts of
    Nothing -> liftIO getCurrentTime
    (Just ts) -> return ts

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



apiSearchTriggers :: Text -> Text -> Maybe Text -> Maybe Int -> Maybe Int -> AppM [TriggerResponse]
apiSearchTriggers ns criteria msearch_by mlimit moffset = do

  triggers <- runDb $ E.select $
                E.from $ \trigger -> do
                search_by trigger
                E.limit limit
                E.offset offset
                return trigger

  let trigger_responses = map (\(Entity _ trigger) -> triggerToTriggerResponse trigger) triggers
  return trigger_responses

  where
  limit  = fromIntegral $ maybe (-1) id mlimit
  offset = fromIntegral $ maybe 0 id moffset
  search_by trigger = case msearch_by of
                Nothing         -> where_clause TriggerKey
                (Just "value")  -> where_clause TriggerValue
                (Just "author") -> where_clause TriggerAuthor
                -- default to key
                (Just _)        -> where_clause TriggerKey
    where
    where_clause field =
      E.where_ (
        (trigger E.^. TriggerNamespace E.==. E.val ns)
        E.&&.
        ((trigger E.^. field) `E.like` ((E.%) E.++. E.val criteria E.++. (E.%)))
        )
