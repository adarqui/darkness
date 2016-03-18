{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}

module Main where



import           Data.Vector                       (Vector, fromList)
import           Options.Generic
import           Statistics.Sample

import           Darkness.Commands.Math.Statistics



data Params
  = Range [Double]
  | Mean [Double]
  | Welford_Mean [Double]
  | Harmonic_Mean [Double]
  | Geometric_Mean [Double]
  | Central_Moment Int [Double]
  | Skewness [Double]
  | Kurtosis [Double]
  | Variance [Double]
  | Variance_Unbiased [Double]
  | StdDev [Double]
  | Fast_Variance [Double]
  | Fast_Variance_Unbiased [Double]
  | Fast_StdDev [Double]
  deriving (Generic, Show)

instance ParseRecord Params



main :: IO ()
main =  do
  runParams =<< getRecord "Descriptive statistics"



runParams :: Params -> IO ()
runParams (Range v)                  = p range v
runParams (Mean v)                   = p mean v
runParams (Welford_Mean v)           = p welfordMean v
runParams (Harmonic_Mean v)          = p harmonicMean v
runParams (Geometric_Mean v)         = p geometricMean v
runParams (Central_Moment k v)       = p (centralMoment k) v
runParams (Skewness v)               = p skewness v
runParams (Kurtosis v)               = p kurtosis v
runParams (Variance v)               = p variance v
runParams (Variance_Unbiased v)      = p varianceUnbiased v
runParams (StdDev v)                 = p stdDev v
runParams (Fast_Variance v)          = p fastVariance v
runParams (Fast_Variance_Unbiased v) = p fastVarianceUnbiased v
runParams (Fast_StdDev v)            = p fastStdDev v



p :: (Show r) => (Vector v -> r) -> [v] -> IO ()
p f v = putStrLn $ show $ f $ fromList v
