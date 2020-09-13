#!/bin/sh
set -e -o pipefail

NC='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'

git diff --exit-code --quiet HEAD -- LICENSE README.md
if [ $? -ne 0 ]; then
  echo "${RED}Please commit changes for 'LICENSE' and 'README.md' before Orphan Branch Setup${NC}"
  exit 1
fi

targetBranch=$1

if [ ! -n "$targetBranch" ]; then
  echo "${RED}Please specify target branch name${NC}"
  exit 1
fi

if [ ! -e './LICENSE' ] || [ ! -e './README.md' ]; then
  echo "${RED}Please make sure that 'LICENSE' and 'README.md' exist${NC}"
  exit 1
fi

branchExists=$(git branch -a --format="%(refname:short)" | grep -e "^$targetBranch$")

if [ -n "$branchExists" ]; then
  echo "${GREEN}Orphan Branch Setup for '$targetBranch' has already done!${NC}"
  exit 0
fi

currentBranch=$(git symbolic-ref HEAD | sed 's|^refs/heads/||')

git switch --orphan $targetBranch
git restore --source $currentBranch LICENSE README.md
git add LICENSE README.md
git commit -m 'initial commit'
git push -u origin $targetBranch
git switch $currentBranch

echo "${GREEN}Orphan Branch Setup for '$targetBranch' has completed!${NC}"
