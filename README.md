<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project contributions only; see LICENSE-SCOPE.md. Third-party material retains its own terms.
-->
# PSVR-2-DroidXR

I already had a PSVR 2 I liked. I wanted to keep its OLED screens and eye tracking, move the computing to my phone, and get away from the cable running back to a PC. That's DroidXR.

**Skyrim VR runs from my Android phone with eye tracking and eye-tracked DXVK foveation working in PSVR 2. SGSR2 processing works well and improves the image.** This is the Linux-container setup I built and tested on my rooted RedMagic phone. The headset connects to the phone through a cable and suitable adapter; the phone does the computing.

[See it running and read the story](https://astroskyoffical.github.io/PSVR-2-DroidXR/?v=journal-20#breakthrough).

## How it works

The project's Android display app prepares the headset connection. Droidspaces runs the Linux workspace on the phone, custom Mesa/Turnip draws on its GPU, and Monado coordinates the headset display and tracking. A display lease lets Linux drive PSVR 2 while Android keeps the phone screen.

Monado supplies gaze to the modified DXVK, which translates the game's graphics commands and moves shading-rate maps for selected Skyrim passes. SGSR2 performs a separate image-reconstruction step. The gaze-enabled source now matches the build used in my phone setup, and its patches are published below.

- [DXVK gaze source patches and build instructions](research/dxvk-gaze/README.md), including the source-only ZIP.
- [Rendering explanation and technical records](guides/foveated-rendering.md).
- [Modified Mesa Turnip component](https://github.com/astroskyoffical/PSVR-2-DroidXR/releases/tag/mesa-turnip-2026.10.14-r1) and [installation guide](guides/linux-container/docs/mesa.md).

I also connected my Quest 3 through a modified WiVRn client and USB Ethernet with Wi-Fi switched off. That separate streaming route is in the [journal player](https://astroskyoffical.github.io/PSVR-2-DroidXR/?v=journal-20#quest-experiment), with the original recording at 4x and a 1x option. [Setup and network notes](guides/quest-streaming.md) explain the connection.

## What's next

- **Native Android, in development:** an image and head-follow are working. Frame pacing, stability and the rest of the native headset/controller integration are next. [Native progress](guides/native-android.md).
- **Reproduction and portability:** the complete installer and portable power setup are in development. Published components, prerequisites and remaining source/notice work are tracked in [release status](guides/linux-container/docs/licenses-and-provenance.md).
- **More routes and apps:** PC streaming to PSVR 2, Alyx compatibility, broader app support and new phone/headset ports are further integration work.

## The reference setup

| Component | Reference identity |
|---|---|
| Phone | NX809J / RedMagic; Android 16, API 36; AArch64 |
| Kernel | `6.12.23-android16-OP-WILD` |
| Container manager | [Droidspaces](https://github.com/ravindu644/Droidspaces-OSS), Android app 6.3.0 / code 6300 |
| Container OS | Ubuntu 26.04 LTS, Resolute Raccoon; ARM64 |
| Android display app | Project display app, 1.0.0-preview / code 100 |
| Graphics | Separate custom Turnip libraries for game apps and compositor |
| Runtime | Linux Monado and the existing tracking/compatibility bridge |

![Linux app frames pass through Monado and custom Mesa to PSVR2 while Android keeps its own screen.](guides/linux-container/docs/flow.svg)

## Follow the setup in order

1. Match the [device, kernel and DSC requirements](guides/linux-container/docs/device-and-dsc.md).
2. Prepare [Droidspaces and the container](guides/linux-container/docs/droidspaces.md), then resolve your own [paths and configuration](guides/linux-container/docs/paths-and-configuration.md).
3. Review the [Android display app and launcher](guides/linux-container/docs/linkdoctor-and-launchers.md), [Mesa component](guides/linux-container/docs/mesa.md), and [Monado/tracking dependencies](guides/linux-container/docs/monado-and-input.md).
4. Read the [display-lease handoff](guides/linux-container/docs/drm-leasing.md), then follow the [verification and restore sequence](guides/linux-container/docs/verify-and-restore.md).
5. Add the [recovered DXVK gaze patches](research/dxvk-gaze/README.md) and recorded settings to the existing game setup. Use the [optional app notes](guides/linux-container/docs/optional-test-apps.md) for separate game experiments.

Use the component identities and notices in each guide, keep backups of what you replace, and obtain proprietary drivers and games through their official channels.

## Thank you to iVRy's PSVR2 research

Without iVRy's research and shared findings, I would not have understood PSVR2's DSC requirements or got this part working. His reverse-engineering and shared Display Stream Compression findings helped make the display work possible. See [iVRy's official PSVR2 project](https://store.steampowered.com/app/1021000/BETA_iVRy_Driver_for_SteamVR_PSVR2_Premium_Edition/), developed by iVRy / Mediator Software.

AstroPC built the phone-hosted hardware integration, Android/display integration and connecting software. Credit also belongs to Droidspaces, Monado, Mesa/Turnip, DXVK, OpenXR, Ignition, PSVR2Toolkit, Qualcomm SGSR2, AMD FSR/RCAS and their contributors.

## License and community

Forks and contributions are welcome. Original project software and documentation are **GPL-3.0-only within the files and portions listed in [LICENSE-SCOPE.md](LICENSE-SCOPE.md)**; commercial use is allowed under those terms. The full license is in [LICENSE](LICENSE), with credit in [NOTICE](NOTICE). Preserve applicable source, license and attribution obligations. Upstream components, media and proprietary prerequisites retain their own terms.

DroidXR is an independent community project, not affiliated with or endorsed by Sony Interactive Entertainment, Meta, Valve or other referenced platform vendors. Trademarks belong to their owners.

## Website publishing

The original recording is served directly by Pages without reencoding or a large Git blob. The standard Actions workflow fetches the full MP4 from the last successful Pages deployment, verifies its size and hash, and includes it in the next site artifact. A Pages-only rebuild has completed successfully; the workflow has no release fallback.

The local original and verified local archive are recovery copies. If the previous Pages media is unavailable or mismatched, the build stops before deployment and recovery uses one of those copies. The expiring Actions artifact is not the rebuild source. Publishing uses the existing GitHub Pages environment and temporary job tokens.
