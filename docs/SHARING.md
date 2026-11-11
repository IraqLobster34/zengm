# Sharing the mod

Fork: https://github.com/IraqLobster34/zengm

The mod lives on branch `mods`. After publishing that branch, share:

https://github.com/IraqLobster34/zengm/tree/mods

## Ready to share

- Mod README with screenshots, setup, supported settings, and limitations.
- Eight screenshots in `docs/screenshots/` and a complete gallery.
- Initial release notes in `RELEASE_NOTES.md`.
- Community announcement draft in `docs/ANNOUNCEMENT.md`.
- Original license and upstream README preserved.

## Publishing

Review the files, then commit and push `mods` to `origin`. The local `origin` points to your fork; `upstream` points to the original ZenGM repository. Creating these files does not publish them.

After pushing, check the branch URL above and confirm its README and images load. Optionally make `mods` the default branch in GitHub settings so the normal repository URL opens the mod.

For a GitHub release, target the published `mods` commit, use the title **NBA Cup mod — initial release**, and copy `RELEASE_NOTES.md` as its description. GitHub supplies source ZIP/tar downloads for a tagged release.

Share source, the license, and local setup instructions. Do not attach compiled playable builds or installers, or enable a playable hosted site; the original `LICENSE.md` restricts those forms of distribution.

## Screenshots for a post

1. `01-cup-bracket.png` — lead image.
2. `02-group-standings.png` — group play.
3. `04-player-awards.png` — profile honors.
4. `05-team-history.png` — team Cup wins.
5. `06-league-history.png` — season-by-season results.

A local source ZIP is also prepared in `output/share/`. It is a source snapshot, not an installer, and does not contain browser saves. Keep `LICENSE.md` included if you repackage it.
