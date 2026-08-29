#!/usr/bin/env bash
# Propagate experiments/<name>/ from the source branch onto each experiment branch.
#
# Each experiment lives twice: as experiments/<name>/ on main, and as the root of
# a standalone branch <name> that PCIbex serves assets from. This script makes the
# branch match main by adding one ordinary commit whose tree is main's
# experiments/<name>/ subtree. It never rewrites or force-pushes, and it does not
# touch your working tree, so it is safe to run at any time.
#
# Usage:
#   experiments/sync-to-branches.sh            # update local branches only
#   experiments/sync-to-branches.sh --push     # also push them to the remote
#
# Environment overrides: SOURCE_BRANCH (main), REMOTE (origin), EXPERIMENTS.

set -euo pipefail

SOURCE_BRANCH="${SOURCE_BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
EXPERIMENTS="${EXPERIMENTS:-conceptual-task morphophonology morphosyntax norming}"
PUSH=0
[ "${1:-}" = "--push" ] && PUSH=1

cd "$(git rev-parse --show-toplevel)"

src="$(git rev-parse --verify "$SOURCE_BRANCH")"
src_short="$(git rev-parse --short "$src")"
synced=()

for exp in $EXPERIMENTS; do
  prefix="experiments/$exp"

  if ! git rev-parse -q --verify "$src:$prefix" >/dev/null 2>&1; then
    echo "skip  $exp  ($prefix absent on $SOURCE_BRANCH)"
    continue
  fi
  tree="$(git rev-parse "$src:$prefix")"

  if git rev-parse -q --verify "refs/heads/$exp" >/dev/null 2>&1; then
    tip="$(git rev-parse "refs/heads/$exp")"
  elif git rev-parse -q --verify "refs/remotes/$REMOTE/$exp" >/dev/null 2>&1; then
    tip="$(git rev-parse "refs/remotes/$REMOTE/$exp")"
  else
    echo "skip  $exp  (no branch $exp locally or on $REMOTE)"
    continue
  fi

  if [ "$(git rev-parse "$tip^{tree}")" = "$tree" ]; then
    echo "ok    $exp  already in sync"
    continue
  fi

  new="$(git commit-tree "$tree" -p "$tip" -m "Sync from $SOURCE_BRANCH:$prefix

Mirrors $prefix as of $src_short.")"
  git update-ref "refs/heads/$exp" "$new" "$tip" 2>/dev/null \
    || git update-ref "refs/heads/$exp" "$new"
  echo "sync  $exp  $(git rev-parse --short "$tip") -> $(git rev-parse --short "$new")"
  synced+=("$exp")
done

if [ "$PUSH" = "1" ] && [ "${#synced[@]}" -gt 0 ]; then
  echo
  for exp in "${synced[@]}"; do
    echo "push  $exp -> $REMOTE/$exp"
    git push "$REMOTE" "refs/heads/$exp:refs/heads/$exp"
  done
elif [ "${#synced[@]}" -eq 0 ]; then
  echo
  echo "Nothing to do; every experiment branch already matches $SOURCE_BRANCH."
fi
