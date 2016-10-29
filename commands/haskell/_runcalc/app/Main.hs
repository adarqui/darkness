{-# LANGUAGE DataKinds         #-}
{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TypeOperators     #-}

module Main where



import           Data.Typeable       (Typeable)
import           Options.Generic

import           Darkness.Run.HR
import           Darkness.Run.VO2Max



newtype HRMAX = HRMAX { runHRMAX :: Double }
  deriving (Show, Read, Generic, Typeable)

instance ParseFields HRMAX
instance ParseField HRMAX
instance ParseRecord HRMAX



data RunTest
  = HRMax_Haskell_Fox      Double
  | HRMax_Robergs_Landwehr Double
  | VO2Max_Cooper_Meters   Double
  | VO2Max_Cooper_Miles    Double
  | VO2Max_USO             Double Double
  deriving (Show, Generic, Typeable)

instance ParseRecord RunTest



main :: IO ()
main = do
  runApp =<< getRecord "runcalc"



runApp :: RunTest -> IO ()
runApp op = case op of
  HRMax_Haskell_Fox age       -> putStrLn $ hrMaxPretty $ hrMaxHaskellFox age
  HRMax_Robergs_Landwehr age  -> putStrLn $ hrMaxPretty $ hrMaxRobergsLandwehr age
  VO2Max_Cooper_Meters meters -> putStrLn $ vo2Pretty $ cooperMeters meters
  VO2Max_Cooper_Miles miles   -> putStrLn $ vo2Pretty $ cooperMiles miles
  VO2Max_USO hr_max hr_min    -> putStrLn $ vo2Pretty $ uso hr_max hr_min
