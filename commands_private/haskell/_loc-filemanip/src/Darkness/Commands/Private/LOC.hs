module Darkness.Commands.Private.LOC (
  findFilesBySuffix,
  countLinesOfFiles
) where

import           System.FilePath.Find (FileType (..), always, extension,
                                       fileType, find, (&&?), (==?))

import           System.Directory     (canonicalizePath)

import qualified Data.Text            as T (lines)
import qualified Data.Text.IO         as T (readFile)



findFilesBySuffix :: [String] -> FilePath -> IO [FilePath]
findFilesBySuffix suffixes path = do
  canonical <- canonicalizePath path
  find
    always
    (
      fileType ==? RegularFile
      &&?
      (extension >>= \ext -> return $ elem ext suffixes)
    )
    canonical


-- | TODO: Need to handle failure to open due to perms etc.
--
countLinesOfFiles :: [FilePath] -> IO Int
countLinesOfFiles files =
  sum <$> mapM (\file -> (length . T.lines) <$> T.readFile file) files
