{-# LANGUAGE DataKinds     #-}
{-# LANGUAGE TypeOperators #-}

module Darkness.Listeners.Triggers.Api.Client where



import           Control.Monad.Trans.Either         (EitherT, left, runEitherT)
import           Data.Text                          (Text)
import Data.Time (UTCTime)
import           Servant
import           Servant.Client

import           Darkness.Listeners.Triggers.Api
import           Darkness.Listeners.Triggers.Config (triggersServiceHost,
                                                     triggersServicePort)
import           Darkness.Listeners.Triggers.Types  (TriggerRequest (..),
                                                     TriggerResponse (..))



clientApi :: Proxy TriggerAPI
clientApi = Proxy



clientGetAllTriggers :<|> clientGetTriggers :<|> clientGetTrigger :<|> clientCreateTrigger :<|> clientUpdateTrigger :<|> clientDeleteTrigger :<|> clientSearchTriggers = client clientApi (BaseUrl Http triggersServiceHost triggersServicePort)



runClientGetAllTriggers :: IO (Either String [TriggerResponse])
runClientGetAllTriggers = fixResult <$> runEitherT clientGetAllTriggers



runClientGetTriggers :: Text -> IO (Either String [TriggerResponse])
runClientGetTriggers ns = fixResult <$> runEitherT (clientGetTriggers ns)



runClientGetTrigger :: Text -> Text -> Maybe Text -> Maybe UTCTime -> IO (Either String TriggerResponse)
runClientGetTrigger ns key mauthor mts = fixResult <$> runEitherT (clientGetTrigger ns key mauthor mts)



runClientCreateTrigger :: TriggerRequest -> Maybe UTCTime -> IO (Either String TriggerResponse)
runClientCreateTrigger trigger_request mts = fixResult <$> runEitherT (clientCreateTrigger trigger_request mts)



runClientUpdateTrigger :: Text -> Text -> TriggerRequest -> IO (Either String TriggerResponse)
runClientUpdateTrigger ns key trigger_request = fixResult <$> runEitherT (clientUpdateTrigger ns key trigger_request)



runClientDeleteTrigger :: Text -> Text -> IO (Either String ())
runClientDeleteTrigger ns key = fixResult <$> runEitherT (clientDeleteTrigger ns key)



runClientSearchTriggers :: Text -> Text -> Maybe Text -> Maybe Int -> Maybe Int -> IO (Either String [TriggerResponse])
runClientSearchTriggers ns criteria msearch_by mlimit moffset = fixResult <$> runEitherT (clientSearchTriggers ns criteria msearch_by mlimit moffset)



fixResult :: Either ServantError a -> Either String a
fixResult (Left err) = Left (show err)
fixResult (Right v)  = Right v
