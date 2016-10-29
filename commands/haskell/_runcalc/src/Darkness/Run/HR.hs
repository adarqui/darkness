-- https://en.wikipedia.org/wiki/Heart_rate
--


module Darkness.Run.HR (
    hrMaxHaskellFox
  , hrMaxRobergsLandwehr
  , hrMaxPretty
) where



import           Text.Printf



-- Haskell & Fox
--
-- HRmax = 220 − age
--

hrMaxHaskellFox :: Double -> Double
hrMaxHaskellFox age = 220 - age



-- Robergs & Landwehr
--
-- HRmax = 205.8 − (0.685 × age)
--

hrMaxRobergsLandwehr :: Double -> Double
hrMaxRobergsLandwehr age = 205.8 - (0.685 * age)



hrMaxPretty :: Double -> String
hrMaxPretty = printf "%.0f bpm"
