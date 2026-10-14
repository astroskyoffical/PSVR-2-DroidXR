# Licenses, provenance and release gates

This stage contains original documentation and component identity metadata. It does not contain a runnable stack. Component hashes establish file identity; they do not establish matching source, a build recipe, a license grant or physical compatibility.

| Component | Available evidence | Required before distributing its payload |
|---|---|---|
| Production DSC module | Exact preserved binary digest/device/kernel | Matching production source, build configuration and notices; no experimental-source substitution |
| Custom Mesa | Both deployed library digests and resolved ICDs | Exact source/patches/build mapping and all relevant SPDX/licenses |
| Monado | Installed service/libraries/manifest digests; named source directory | Exact revision/patchset/build/dependencies and nested component notices |
| LinkDoctor | Installed APK identity/signature; matching helper assets | Installed Java/source-build identity, explicit app license and dependency notices |
| Launchers/broker/shims | Preserved script and broker-source digests | Rights/license declarations, exact build mapping and complete restore behavior |
| Rootfs | Actual Ubuntu 26.04 LTS ARM64 identity and package records | Image origin/digest, reproduction recipe, package/source manifest and notices if an image ships |
| Ignition/Toolkit/Wine/WayVR/OpenComposite | Recipe paths and some upstream references | Exact deployed revisions/builds and their notices before bundling |
| Sony/SteamVR/games | Acquisition/reference role identified | Keep excluded; no redistribution permission was established |
| Optional Alyx Jailbreak | Official release reference and reference digest | Keep APK excluded unless the author permits redistribution with required notices |

Use [Droidspaces' versioned license](https://github.com/ravindu644/Droidspaces-OSS/blob/v6.3.0/LICENSE), [Mesa's component licensing guidance](https://docs.mesa3d.org/license.html), and the [kernel source licensing rules](https://www.kernel.org/doc/html/latest/process/license-rules.html). Preserve each upstream's actual terms and notices. A project preference for noncommercial use does not replace those licenses.

Obtain proprietary software from authorized sources, including the [Sony PC app](https://store.steampowered.com/app/2580190/PlayStationVR2_App/) and the user's own Steam library. No redistribution rights are inferred from possession of installed files. See the [Steam Subscriber Agreement](https://store.steampowered.com/subscriber_agreement/).

The source directories named `monado-7b5894b` and `mesa-for-android-container-c4365a5a09a1de895377eaec6152a34a9a63b8b4` have no captured `.git/HEAD`. Their names are not verified commits. Read-only library retrieval was denied before any ELF was copied; no privileged transfer workaround was attempted. ELF dependency/build-ID evidence remains open.

Private evidence remains outside this package: raw device/package logs, APK/reference archives, proprietary binaries, room/calibration data, signing material and source-analysis records. The public [manifest](../manifest.json) contains selected identities and unresolved gates only.

Publish these documentation files through the existing repository/website owner after review. Do not label them an installable full release, attach gated binaries, or claim that the release inventory repeated a live headset test. Closing the missing matching-source/build records is the next prerequisite for a complete reproducible package.
