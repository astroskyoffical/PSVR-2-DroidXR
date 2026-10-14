# PSVR-2-DroidXR

Explore [DroidXR: VR on your terms](https://astroskyoffical.github.io/PSVR-2-DroidXR/?v=journal-11).

## Linux-container method

This guide records the existing Linux PCVR route on a rooted RedMagic phone: Droidspaces hosts an ARM64 Linux container, custom Mesa renders on the phone GPU, and Monado presents to PSVR2 through a DRM lease. The Android screen stays with Android.

**Mesa component available; complete headset installer still in preparation.** The [modified Mesa Turnip 2026.10.14-r1 release](https://github.com/astroskyoffical/PSVR-2-DroidXR/releases/tag/mesa-turnip-2026.10.14-r1) provides the two Linux ARM64 drivers, relative ICDs, installer, notices and package records. Its target checks cover installation, hashes, overwrite refusal and Vulkan device discovery. They do not qualify headset presentation or tracking. See [component installation and limits](guides/linux-container/docs/mesa.md).

The production DSC module still lacks matching source. Exact clean build reproduction for Mesa, Monado build/source binding, rootfs image origin and the installed Android display app's source identity remain separate gaps. See [release status](guides/linux-container/docs/licenses-and-provenance.md). Do not substitute an arbitrary kernel module or stock graphics driver.

This route is separate from the native Android/Bionic OpenXR work. Windows drivers running through Wine in the container do not establish native Android completion.

![Linux app frames pass through Monado and custom Mesa to PSVR2. Android HWC lends selected display objects through a DRM lease while keeping the phone screen. USB input reaches the Linux driver bridge.](guides/linux-container/docs/flow.svg)

The Mesa component is a first versioned download, not the whole setup. The guide records the recovered method and its remaining gaps; APK, DSC, Monado and bridge payloads are not included. Official upstream links credit the components and do not imply a tested replacement bundle.

## Recorded baseline

| Component | Recorded identity |
|---|---|
| Phone | NX809J / RedMagic; Android 16, API 36; AArch64 |
| Kernel | `6.12.23-android16-OP-WILD` |
| Container manager | [Droidspaces](https://github.com/ravindu644/Droidspaces-OSS), Android app 6.3.0 / code 6300 |
| Container OS | Ubuntu 26.04 LTS, Resolute Raccoon; `arm64` package records |
| Container selection | `${CONTAINER_NAME}` from the Droidspaces configuration; the label does not identify its distribution |
| Android display app | `com.anland.linkdoctor.next`, 1.0.0-preview / code 100 |
| Graphics | Two custom Turnip libraries, separately selected for compositor and apps |
| Runtime | Linux `${XR_PREFIX}`; exact hashes in the [manifest](guides/linux-container/manifest.json) |

These identities come from preserved files and a read-only inventory. The later Mesa component check installed into a new inactive prefix and discovered the GPU through each driver; it did not create a lease or repeat a headset test. Other phones, kernels, container managers and rootfs images remain unqualified.

## Setup order

First resolve the [paths and account configuration](guides/linux-container/docs/paths-and-configuration.md). The variables below describe your installation; they do not imply that the historical launchers already accept arbitrary paths.

1. Read [device and DSC requirements](guides/linux-container/docs/device-and-dsc.md). Match the phone/kernel before considering a module.
2. Follow the official [Droidspaces](https://www.droidspaces.org/) project, then match the [container settings](guides/linux-container/docs/droidspaces.md). The original rootfs image receipt is still missing.
3. Identify [the Android display app and launch scripts](guides/linux-container/docs/linkdoctor-and-launchers.md). The local APK build differs from the installed APK; neither is bundled here.
4. Review and install the versioned [custom Mesa component](guides/linux-container/docs/mesa.md) into a new prefix, retaining its notices and checking hashes. Its clean source rebuild remains unverified.
5. Recover the [Linux Monado runtime and tracking dependencies](guides/linux-container/docs/monado-and-input.md). Obtain proprietary software through its authorized channels.
6. Understand the [DRM lease handoff](guides/linux-container/docs/drm-leasing.md) before starting the display. One compositor owns headset presentation.
7. Use the [verification and restore sequence](guides/linux-container/docs/verify-and-restore.md) on the already provisioned baseline. Process startup alone does not prove useful tracking or a visible scene.
8. Add [optional test apps](guides/linux-container/docs/optional-test-apps.md) only after the headset path works.

Each component page explains its role, recovered installation evidence, checks and restoration limits. Missing artifacts are identified where they block a step. The repository contains documentation and the website; the separately linked Mesa release contains only its reviewed component files. No APK, kernel module, Monado runtime, rootfs image, proprietary driver, game asset, private log or signing key is included.
