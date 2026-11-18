#!/usr/bin/env bash
# One issue per health check, keyed by $TITLE.
#   FAILED=true   open it with report.md, or comment on the open one
#   FAILED=false  close the open one, if any, noting it's healthy again
set -euo pipefail
n=$(gh issue list --state open --search "in:title \"$TITLE\"" --json number,title --jq ".[] | select(.title == \"$TITLE\") | .number" | head -1)
if [ "$FAILED" = "true" ]; then
  body="$(cat report.md 2>/dev/null || echo 'See the workflow run.')

Workflow run: $RUN"
  if [ -n "$n" ]; then gh issue comment "$n" --body "$body"; else gh issue create --title "$TITLE" --body "$body"; fi
elif [ -n "$n" ]; then
  gh issue close "$n" --comment "Healthy again as of $RUN"
fi
