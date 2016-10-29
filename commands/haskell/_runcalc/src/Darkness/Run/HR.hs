-- https://en.wikipedia.org/wiki/Heart_rate
--


module Darkness.Run.HR (
    hrMaxHaskellFox
  , hrMaxPretty
) where



import           Text.Printf



-- HRmax = 220 − age
--

hrMaxHaskellFox :: Double -> Double
hrMaxHaskellFox age = 220 - age



hrMaxPretty :: Double -> String
hrMaxPretty = printf "%.0f bpm"
