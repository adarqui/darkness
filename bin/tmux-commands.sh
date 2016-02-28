#!/bin/sh

SESSION="dark-commands"
IGNORE_DIRS="private"

tmux new-session -d -s ${SESSION}

COUNT=1
find . -type d -d 1 | egrep -vi "${IGNORE_DIRS}" | while read dir ; do
  dir_stripped=`basename "${dir}"`
  tmux new-window -t $SESSION:"${COUNT}" -n "${dir_stripped}"
  tmux split-window
  tmux select-pane -t 0
  tmux send-keys "cd ${dir_stripped}" C-m
  tmux select-pane -t 1
  tmux send-keys "cd ${dir_stripped}" C-m
  COUNT=$((COUNT+1))
done
