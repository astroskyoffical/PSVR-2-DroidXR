<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project contributions only; see LICENSE-SCOPE.md. Third-party material retains its own terms.
-->
# Custom Mesa / Turnip

## What and why

The route uses hardware rendering on the phone GPU and a modified Turnip display path consuming a DRM lease FD. GPU access and authority to modeset the headset are separate. Stock distro Mesa is not a proven replacement for either custom build.

## Download and install the reviewed component

[Release notes and assets: 2026.10.14-r1](https://github.com/astroskyoffical/PSVR-2-DroidXR/releases/tag/mesa-turnip-2026.10.14-r1)

- [Driver ZIP](https://github.com/astroskyoffical/PSVR-2-DroidXR/releases/download/mesa-turnip-2026.10.14-r1/DroidXR-Mesa-Turnip-2026.10.14-r1.zip): 7,100,677 bytes.
- [SHA256SUMS.txt](https://github.com/astroskyoffical/PSVR-2-DroidXR/releases/download/mesa-turnip-2026.10.14-r1/SHA256SUMS.txt).
- [Subsequent target-check receipt](https://github.com/astroskyoffical/PSVR-2-DroidXR/releases/download/mesa-turnip-2026.10.14-r1/mesa-target-check-2026.10.14-r1.json).

ZIP SHA-256: `8451fa8bac50a57bc3a635f36833ba4f6a997f0d75490359cf60ae4feb9cb046`.

This is a **Linux AArch64/glibc** component, including symbols requiring glibc 2.38. It is not an Android/Bionic library or a complete headset installer. The qualified baseline is NX809J / Android 16 / kernel `6.12.23-android16-OP-WILD`, with Ubuntu 26.04 LTS ARM64. Other devices and rootfs images are unqualified.

After verifying the ZIP checksum and extracting it, run these commands from its extracted directory inside the Linux container, with permission to create the chosen new prefix:

```sh
python3 install.py --prefix /opt/droidxr/releases/mesa-2026.10.14-r1 --dry-run
python3 install.py --prefix /opt/droidxr/releases/mesa-2026.10.14-r1 --install
```

The installer verifies all 15 payloads, refuses an existing prefix and copies into the new prefix. It does not activate either driver globally. Retain `NOTICE-MESA.txt` and `licenses/`. System libraries are prerequisites, not bundled files; consult the archive manifest and observed package records.

The app ICD is `mesa/app/icd/freedreno_icd.json` and the compositor ICD is `mesa/compositor/icd/freedreno_icd.json`, relative to the install prefix. Each resolves its adjacent driver through `../lib/libvulkan_freedreno.so`. Select the intended ICD explicitly per process through your configured launcher. The packaged paths differ from the historical paths below; copying files alone does not update a launcher.

The device owner verified dry-run, installation, both installed driver hashes and overwrite refusal. Each scoped `vulkaninfo --summary` exited 0 and discovered Adreno 840 / Mesa Turnip 26.2.0-devel / Vulkan 1.4.353. DISPLAY and XDG_RUNTIME_DIR were unset, so surface information was skipped. These were inactive-prefix installation and Vulkan discovery checks, not lease, OpenXR, headset presentation, tracking or game tests. The frozen ZIP retains its earlier pending-check wording; the later receipt above records the completed bounded checks without changing the frozen archive.

## Historical installation evidence

Two ICDs select two different deployed libraries:

| Consumer | ICD | Library SHA-256 |
|---|---|---|
| Monado compositor | `turnip-gmemfix/icd/freedreno_icd.kms-priority-20261010.aarch64.json` | `13f03707c59a9577813b7531e86861272ef9654017141e6e927e146505d26f8e` |
| Linux apps | `turnip-kgsl-timeout-c4365a5/icd/freedreno_icd.kgsl-timeout.aarch64.json` | `248cd58786c7a4bc0fef6242bf97c6ef984621caeada7af6f39b618e2ee4f5dc` |

Paths in this table are relative to `${VR_FILES}`, the configured graphics/compatibility files directory inside the container. Resolve it for the Linux desktop account; see [paths and configuration](paths-and-configuration.md). The compositor library is `turnip-gmemfix/lib-kms-priority-20261010/libvulkan_freedreno.so`; the app library is `turnip-kgsl-timeout-c4365a5/lib/libvulkan_freedreno.so`. Both ICD JSONs declare API `1.4.353` and library architecture `64`. Configured paths were resolved and files hashed; an active process's loaded libraries were not inspected during this review.

Historical notes identify custom Mesa `26.2-devel` and a source-name prefix `c4365a5a09`. A source directory named `mesa-for-android-container-c4365a5a09a1de895377eaec6152a34a9a63b8b4` exists, but `.git/HEAD` is absent. The name is not verified commit or build provenance.

**Build reproduction gap:** retained outputs and full hashes identify the published binaries, but an independent clean rebuild has not been reproduced. The complete modified source/patchset and reproducible Meson/compiler/dependency recipe still need binding to these outputs. The published component passed artifact-specific identity, notice, dependency and embedded-path review separately from the DSC module. Follow [Mesa's official licensing guidance](https://docs.mesa3d.org/license.html) and retain per-file SPDX/licenses, including modified WSI/KGSL code. GitHub's automatic source-code archive contains this project repository, not corresponding Mesa source for the two driver binaries.

## Verify

Resolve each ICD to its intended library and compare its digest to [the manifest](../manifest.json). Check the actual renderer/loaded ICD under the controlled session; a JSON's API string alone does not establish GPU acceleration. The historical desktop recipe permits a software fallback, so a running `labwc` alone is insufficient evidence.

For compositor presentation, the selected build must consume `TU_KGSL_DISPLAY_FD=3` through its supported `VK_KHR_display` path. The recovered launcher sets `WSI_DISPLAY_SPLIT=1`: its recorded 4000-pixel-wide mode uses two 2000-pixel-wide planes. This is a configuration requirement of the recovered build, not a universal Mesa option.

## Restore

Keep both original libraries, ICD JSONs and launcher environment together. Restore the original per-process ICD selection when rolling back; replacing only the app driver does not restore the compositor build. No driver changes were made by this review.
