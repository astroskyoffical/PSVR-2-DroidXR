<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project contributions only; see LICENSE-SCOPE.md. Third-party material retains its own terms.
-->
# Optional test apps

Set up and verify the headset first. Applications are optional consumers of that working path, not core installation dependencies.

## Linux OpenXR test scene

A small Linux OpenXR scene is the first useful runtime/presentation check. The preserved setup contains `hello_xr` launch helpers using `Vulkan2`, the Monado runtime JSON and the app ICD. The exact deployed test binary/build still needs pinning; this package supplies no substitute test APK or claims a new physical pass.

## Linux desktop and PCVR games

The recorded desktop is headless `labwc` with hardware GPU rendering, shown inside OpenXR by [WayVR](https://github.com/wayvr-org/wayvr). It uses a private user/session configuration and a `wayvr-input-shim.so`. The recovered source candidate does not establish the deployed AppImage or shim build identity. An optional left-eye MJPEG preview/recording path is diagnostic output, not how the headset displays the desktop.

The game launcher implements **Skyrim VR** through the user's Steam installation, ARM64 Wine/Proton and OpenComposite configuration. A recovered [Skyrim-oriented OpenComposite fork](https://github.com/Wondernuttz/Open-Composite-Unleashed-for-Skyrim-VR) is a source lead, not a verified deployed DLL match. Steam login, legally acquired game files, compatible translation builds and their exact versions are separate prerequisites. No Steam credentials, game assets or Valve payloads are distributed. This evidence does not establish every PCVR game's compatibility.

## Alyx Jailbreak — separate Android experiment

[Alyx Jailbreak v0.183](https://github.com/alferiko/alyx-jailbreak-releases/releases/tag/v0.183) retains its original identity and credits. It is distinct from Valve's Half-Life: Alyx and from the Linux Steam game path above. The tested reference is `Alyx-Jailbreak-0.183.apk`, build 2140; its reference digest is recorded in [the manifest](../manifest.json).

Use the author's official source/release route. No APK is redistributed here because a redistribution grant and complete notices have not been established. Android startup/compatibility work is separate from headset setup; neither this release inventory nor an APK launching establishes immersive PSVR2 compatibility. Do not rebrand it as a DroidXR core app or promise universal Quest/Android XR APK support.
