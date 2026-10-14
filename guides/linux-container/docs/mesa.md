# Custom Mesa / Turnip

## What and why

The route uses hardware rendering on the phone GPU and a modified Turnip display path consuming a DRM lease FD. GPU access and authority to modeset the headset are separate. Stock distro Mesa is not a proven replacement for either custom build.

## Installation evidence

Two ICDs select two different deployed libraries:

| Consumer | ICD | Library SHA-256 |
|---|---|---|
| Monado compositor | `turnip-gmemfix/icd/freedreno_icd.kms-priority-20261010.aarch64.json` | `13f03707c59a9577813b7531e86861272ef9654017141e6e927e146505d26f8e` |
| Linux apps | `turnip-kgsl-timeout-c4365a5/icd/freedreno_icd.kgsl-timeout.aarch64.json` | `248cd58786c7a4bc0fef6242bf97c6ef984621caeada7af6f39b618e2ee4f5dc` |

Paths in this table are relative to `${VR_FILES}`, the configured graphics/compatibility files directory inside the container. Resolve it for the Linux desktop account; see [paths and configuration](paths-and-configuration.md). The compositor library is `turnip-gmemfix/lib-kms-priority-20261010/libvulkan_freedreno.so`; the app library is `turnip-kgsl-timeout-c4365a5/lib/libvulkan_freedreno.so`. Both ICD JSONs declare API `1.4.353` and library architecture `64`. Configured paths were resolved and files hashed; an active process's loaded libraries were not inspected during this review.

Historical notes identify custom Mesa `26.2-devel` and a source-name prefix `c4365a5a09`. A source directory named `mesa-for-android-container-c4365a5a09a1de895377eaec6152a34a9a63b8b4` exists, but `.git/HEAD` is absent. The name is not verified commit or build provenance.

**Build reproduction gap:** the exact modified source, patchset, Meson options, compiler/dependency versions and build-to-library relationship are not yet pinned. Driver downloads will be listed after the particular files pass identity, license/notice, dependency and embedded-path checks. A cleared Mesa component can be published separately from the DSC module; any unresolved source/build reproduction details must remain explicit. Follow [Mesa's official licensing guidance](https://docs.mesa3d.org/license.html) and retain per-file SPDX/licenses, including modified WSI/KGSL code.

## Verify

Resolve each ICD to its intended library and compare its digest to [the manifest](../manifest.json). Check the actual renderer/loaded ICD under the controlled session; a JSON's API string alone does not establish GPU acceleration. The historical desktop recipe permits a software fallback, so a running `labwc` alone is insufficient evidence.

For compositor presentation, the selected build must consume `TU_KGSL_DISPLAY_FD=3` through its supported `VK_KHR_display` path. The recovered launcher sets `WSI_DISPLAY_SPLIT=1`: its recorded 4000-pixel-wide mode uses two 2000-pixel-wide planes. This is a configuration requirement of the recovered build, not a universal Mesa option.

## Restore

Keep both original libraries, ICD JSONs and launcher environment together. Restore the original per-process ICD selection when rolling back; replacing only the app driver does not restore the compositor build. No driver changes were made by this review.
