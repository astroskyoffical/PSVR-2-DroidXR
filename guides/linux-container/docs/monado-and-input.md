# Linux Monado, tracking and input

## What and why

Monado supplies the Linux OpenXR runtime and compositor. The recorded PSVR2 driver route includes Ignition, a Wine/Proton server and Sony's Windows driver. That is the preserved Linux-container route; it is not the native Android/Bionic implementation.

## Installation evidence

`${XR_PREFIX}` is the configured Linux runtime installation prefix. Resolve it from the installed runtime before use; see [paths and accounts](paths-and-configuration.md). Its manifest is:

```text
${XR_PREFIX}/share/openxr/1/openxr_monado.json
```

It names `Monado`, selects `../../../lib/libopenxr_monado.so`, and points the management library to `../../../lib/libmonado.so`. Exact installed hashes are in [the manifest](../manifest.json). A source directory labeled `monado-7b5894b` was observed, but has no `.git/HEAD`; its short name is not a verified revision or a complete build receipt.

The launcher selects the compositor ICD described in [Mesa](mesa.md), starts the runtime through `${SESSION_SCRIPTS}/psvr2-lease run --`, and sets the following recovered environment:

| Setting | Recorded value |
|---|---|
| `XRT_COMPOSITOR_FORCE_VK_DISPLAY` | `0` (preserved build's selector; not portable to another revision) |
| `XRT_COMPOSITOR_DESIRED_MODE` | `0` |
| `XRT_COMPOSITOR_SCALE_PERCENTAGE` | `${PSVR2_SCALE:-100}` |
| `WSI_DISPLAY_SPLIT` | `1` |
| `XDG_RUNTIME_DIR` | Existing runtime directory for the selected Linux desktop account; no fixed UID |
| Service `HOME` | `${SERVICE_HOME}` from the runtime service account (root in the recorded recipe); distinct from the desktop account |

Apps receive `XR_RUNTIME_JSON` pointing to the manifest above and the separate app ICD. A runtime JSON being present does not prove that a client loads the intended service or that pose data is meaningful.

**Fresh-install gap:** exact modified Monado source, build options/dependencies, patches and their connection to the installed binaries remain unresolved. No runtime binary or guessed build recipe is distributed here.

## Tracking, Sense and gaze dependencies

The preserved configuration names:

- [Ignition](https://github.com/BnuuySolutions/Ignition): bridge between Linux driver code and a Windows server running through Wine.
- [PSVR2Toolkit Linux support](https://github.com/BnuuySolutions/PSVR2Toolkit/wiki/Linux-support): a dependency of that recorded bridge route. Exact deployed versions and bridge binaries still require pinning.
- A Wine prefix under `${VR_FILES}/ignition/prefix` and a `Proton 11.0 (ARM64)` directory. A directory label is not a verified release/build identity.
- Authorized acquisition of the [Sony PlayStation VR2 App](https://store.steampowered.com/app/2580190/PlayStationVR2_App/) and required SteamVR components. Their Windows requirements do not promise Android support; no proprietary drivers or assets ship here.
- `STEAMVR_LH_ENABLE=1`, `STEAMVR_LH_DRIVER=playstation_vr2`, and the recorded Ignition SteamVR path when its `enabled` marker is present.
- Private driver configuration at `${LINUX_HOME}/.config/psvr2-steamvr` and a play-area helper. The launcher reapplies room configuration after restart. The saved fallback `2 2 1.5` is historical behavior, not a room measurement suitable for another wearer.
- Sense hidraw access through `PROTON_ENABLE_HIDRAW=0x054c/0x0e45,0x054c/0x0e46` and `PSVR2_TOOLKIT_POLL_RATE=1`. The saved scripts expect Android Bluetooth pairing, host HID/input nodes and container visibility. They also run a controller LED helper.

These are recovered recipe inputs. They do not certify controller optical poses, haptic correctness, gaze calibration, boundaries or a complete physical tracking test. No eye-calibration solver/source or accepted gaze result is supplied by this release inventory. Keep raw input, optical tracking and calibrated gaze as separate verification steps.

## Verify and restore

Verify exact service/library identities, the client-selected runtime, USB/HID visibility, meaningful head poses and headset presentation before adding controllers, gaze or games. Follow [the controlled sequence](verify-and-restore.md). Keep private map/calibration/room state out of a public archive. Restore the original runtime prefix, manifests and driver environment together when reverting; no runtime changes were made during this review.
