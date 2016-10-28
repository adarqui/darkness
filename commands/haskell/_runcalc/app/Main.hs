{-# LANGUAGE DataKinds         #-}
{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TypeOperators     #-}

module Main where



import           Data.Typeable               (Typeable)
import           Options.Generic

import           Darkness.Run.VO2Max



data RunTest
  = VO2Max_Cooper_Meters Double
  | VO2Max_Cooper_Miles  Double
  deriving (Show, Generic, Typeable)

-- instance Show RunTest where
--   show RunTest_VO2Max_Cooper_Meters = "haskell"
--   show RunTest_VO2Max_Cooper_Miles  = "purescript"

-- instance Read RunTest where
--   readsPrec _ "vo2max-cooper-meters"= [(RunTest_VO2Max_Cooper_Meters, "")]
--   readsPrec _ "vo2max-cooper-miles" = [(RunTest_VO2Max_Cooper_Miles, "")]
--   readsPrec _ _                     = error "RunTest not supported"

instance ParseRecord RunTest



main :: IO ()
main = do
  runApp =<< getRecord "runcalc"



runApp :: RunTest -> IO ()
runApp op = case op of
  VO2Max_Cooper_Meters meters -> putStrLn $ cooperPretty $ cooperMeters meters
  VO2Max_Cooper_Miles miles   -> putStrLn $ cooperPretty $ cooperMiles miles
