{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RecordWildCards   #-}

module Darkness.Listeners.Triggers.Types (
  TriggerRequest (..),
  defaultTriggerRequest,
  TriggerResponse (..),
  defaultTriggerResponse
) where



import           Control.Monad   (mzero)
import           Data.Aeson
import           Data.Text       (Text)
import           Data.Time       (UTCTime)
import           Data.Typeable   (Typeable)
import           GHC.Generics    (Generic)



data TriggerRequest = TriggerRequest {
  triggerRequestAuthor     :: Text,
  triggerRequestAuthorMeta :: Maybe Text,
  triggerRequestNamespace  :: Text,
  triggerRequestKey        :: Text,
  triggerRequestValue      :: Text
} deriving (Eq, Show, Generic, Typeable)



instance FromJSON TriggerRequest where
  parseJSON (Object o) = TriggerRequest
    <$> o .: "author"
    <*> o .:?"author_meta"
    <*> o .: "namespace"
    <*> o .: "key"
    <*> o .: "value"
  parseJSON _ = mzero



instance ToJSON TriggerRequest where
  toJSON TriggerRequest{..} = object
    [ "author" .= triggerRequestAuthor
    , "author_meta" .= triggerRequestAuthorMeta
    , "namespace" .= triggerRequestNamespace
    , "key" .= triggerRequestKey
    , "value" .= triggerRequestValue
    ]



defaultTriggerRequest :: TriggerRequest
defaultTriggerRequest = TriggerRequest {
  triggerRequestAuthor = "",
  triggerRequestAuthorMeta = Nothing,
  triggerRequestNamespace = "",
  triggerRequestKey = "",
  triggerRequestValue = ""
}



data TriggerResponse = TriggerResponse {
--  triggerResponseId             :: Int64,
  triggerResponseAuthor         :: Text,
  triggerResponseAuthorMeta     :: Maybe Text,
  triggerResponseNamespace      :: Text,
  triggerResponseKey            :: Text,
  triggerResponseValue          :: Text,
  triggerResponseCounter        :: Int,
  triggerResponseCreatedAt      :: UTCTime,
  triggerResponseModifiedAt     :: UTCTime,
  triggerResponseLastAccessedAt :: UTCTime
} deriving (Eq, Show, Generic, Typeable)



instance FromJSON TriggerResponse where
  parseJSON (Object o) = TriggerResponse
--    <$> o .: "id"
    <$> o .: "author"
    <*> o .:?"author_meta"
    <*> o .: "namespace"
    <*> o .: "key"
    <*> o .: "value"
    <*> o .: "counter"
    <*> o .: "created_at"
    <*> o .: "modified_at"
    <*> o .: "last_accessed_at"
  parseJSON _ = mzero



instance ToJSON TriggerResponse where
  toJSON TriggerResponse{..} = object
    [ {-"id" .= triggerResponseId
    ,-}
      "author" .= triggerResponseAuthor
    , "author_meta" .= triggerResponseAuthorMeta
    , "namespace" .= triggerResponseNamespace
    , "key" .= triggerResponseKey
    , "value" .= triggerResponseValue
    , "counter" .= triggerResponseCounter
    , "created_at" .= triggerResponseCreatedAt
    , "modified_at" .= triggerResponseModifiedAt
    , "last_accessed_at" .= triggerResponseLastAccessedAt
    ]




defaultTriggerResponse :: TriggerResponse
defaultTriggerResponse = TriggerResponse {
--  triggerResponseId = 0,
  triggerResponseAuthor = "",
  triggerResponseAuthorMeta = Nothing,
  triggerResponseNamespace = "",
  triggerResponseKey = "",
  triggerResponseValue = "",
  triggerResponseCounter = 0,
  triggerResponseCreatedAt = undefined,
  triggerResponseModifiedAt = undefined,
  triggerResponseLastAccessedAt = undefined
}
