{-# LANGUAGE DataKinds         #-}
{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TypeOperators     #-}

module Main where



import           Data.Typeable               (Typeable)
import           Options.Generic

import           Darkness.Run.HR
import           Darkness.Run.VO2Max



data RunTest
  = HRMAX_Haskell_Fox Double
  | VO2Max_Cooper_Meters Double
  | VO2Max_Cooper_Miles  Double
  deriving (Show, Generic, Typeable)

instance ParseRecord RunTest



main :: IO ()
main = do
  runApp =<< getRecord "runcalc"



runApp :: RunTest -> IO ()
runApp op = case op of
  HRMAX_Haskell_Fox age       -> putStrLn $ hrMaxPretty $ hrMaxHaskellFox age
  VO2Max_Cooper_Meters meters -> putStrLn $ cooperPretty $ cooperMeters meters
  VO2Max_Cooper_Miles miles   -> putStrLn $ cooperPretty $ cooperMiles miles
