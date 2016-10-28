module Darkness.Run.VO2Max (
    cooperMeters
  , cooperMiles
  , cooperPretty
) where



import           Text.Printf



-- Kenneth H. Cooper conducted a study for the United States Air Force in the late 1960s. One of the results of this was the Cooper test in which the distance covered running in 12 minutes is measured. Based on the measured distance, an estimate of VO2 max [in mL/(kg·min)] is:
--
-- VO2max = (d12 - 504.9) / 44.73
-- where d12 is distance (in metres) covered in 12 minutes
--
-- An alternative equation is:
--
-- VO2max = (35.97 * d12) - 11.29
-- where d12 is distance (in miles) covered in 12 minutes,
--

cooperMeters :: Double -> Double
cooperMeters d12 = (d12 - 504.9) / 44.73

cooperMiles :: Double -> Double
cooperMiles d12 = (35.97 * d12) - 11.29

cooperPretty :: Double -> String
cooperPretty = printf "%.2f mL/(kg·min)"
