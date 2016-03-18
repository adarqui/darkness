# stats

Experimental statistics command.

TODO: More descriptive help messages. I'm using optparse-generic soo.. it auto-generates everything.


```
$ ./bin/stats --help
Descriptive statistics

Usage: stats (range | mean | welford_mean | harmonic_mean | geometric_mean |
             central_moment | skewness | kurtosis | variance | variance_unbiased
             | stddev | fast_variance | fast_variance_unbiased | fast_stddev)

Available options:
  -h,--help                Show this help text

Available commands:
  range
  mean
  welford_mean
  harmonic_mean
  geometric_mean
  central_moment
  skewness
  kurtosis
  variance
  variance_unbiased
  stddev
  fast_variance
  fast_variance_unbiased
  fast_stddev


y:stats x$ ./bin/stats mean --help
Usage: stats mean [DOUBLE]

Available options:
  -h,--help                Show this help text


$./bin/stats variance 1 2 3 100
1801.25

$ ./bin/stats mean 1 2 3 100
26.5

$ ./bin/stats skewness 1 2 3 100

...
```
