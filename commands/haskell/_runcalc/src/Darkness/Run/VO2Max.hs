-- https://en.wikipedia.org/wiki/VO2_max
--

module Darkness.Run.VO2Max (
    cooperMeters
  , cooperMiles
  , vo2Pretty
  , uso
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

-- Uth–Sørensen–Overgaard–Pedersen estimation[edit]
-- Another estimate of VO2 max, based on maximum and resting heart rates, was created by a group of researchers from Denmark.[4] It is given by:
--
-- VO2max =~ 15.3 * (HRmax / HRmin)
--
-- This equation uses the ratio of maximum heart rate (HRmax) to resting heart rate (HRrest) to predict VO2 max, and is measured in units of mL/kg/minute. The researchers cautioned that the conversion rule was based on measurements on well-trained men aged 21 to 51 only, and may not be reliable when applied to other sub-groups. They also advised that the formula is most reliable when based on actual measurement of maximum heart rate, rather than an age-related estimate.
--

uso :: Double -> Double -> Double
uso hr_max hr_min = 15.3 * (hr_max / hr_min)



vo2Pretty :: Double -> String
vo2Pretty = printf "%.2f mL/(kg·min)"
