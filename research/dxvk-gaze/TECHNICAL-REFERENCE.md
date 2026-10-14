<!-- Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project documentation only. Upstream components retain their terms. -->
# Build, runtime and test reference

This appendix retains the exact inputs and conditions for the phone-tested DXVK build.
The [main guide](README.md) contains the normal install, check and restore steps.

## Source and output identities

The upstream DXVK commit is `a6764047e587178283fcde4073ae6e1410af594f`.
The original two patches apply cleanly to that commit.
Patch 0002 changes 14 source files.
The timing base adds the fifteenth altered input.
All 15 altered inputs match SHA-256 records in the retained compiler objects.

| Retained output | SHA-256 |
|---|---|
| `d3d11.dll` | `ed41a52873bc060463d33a9affe48f501236b966a5637a66ecd6ee75495b4ac4` |
| `dxgi.dll` | `abca767a0842e3f20aa0e6c05f5f5fe24f4b1bee460d27d4fb106b1842b0e1d1` |

The [provenance file](provenance.json) lists the altered inputs and output identities.
The retained build matches the saved phone-session DLL pair.
These records establish the source/build link.
They do not promise identical hashes from a new build.

## Build tools

The retained build used Windows x64 Release and these tools.

| Tool | Recorded version |
|---|---|
| MSVC | `19.44.35228` |
| Linker | `14.44.35228.0` |
| Windows SDK | `10.0.26100.0` |
| Python | `3.11` |
| Meson | `1.12.1` |
| Ninja | `1.12.1` |
| glslang tool path | `glslang-16.6.0` |

The exact Python patch version is not retained.
An independent deterministic binary rebuild remains a separate check.
This documentation update did not build a new DLL or run a new phone test.

## Submodule pins

| Path | Commit |
|---|---|
| `include/native/directx` | `9df86f2341616ef1888ae59919feaa6d4fad693d` |
| `include/spirv` | `04f10f650d514df88b76d25e83db360142c7b174` |
| `include/vulkan` | `5d94bb4dcc968cccce1f601324fcaf3eda92a52b` |
| `subprojects/dxbc-spirv` | `fe5a4ef1e99357c8b9f57e4cfb1195c3dae9707f` |
| `subprojects/libdisplay-info` | `275e6459c7ab1ddd4b125f28d0440716e4888078` |

## Build the DLLs

Use a fresh source directory and a fresh output directory.
Use a developer shell with the listed tools available.
Place the patch files in `C:/patches`.
Run the commands below in order.
After the submodule update, compare `git submodule status --recursive` with the table above.
Stop if the pins do not match.

```powershell
git clone --no-checkout https://github.com/doitsujin/dxvk.git C:/build/psvr2-dxvk-src
git -C C:/build/psvr2-dxvk-src checkout a6764047e587178283fcde4073ae6e1410af594f
git -C C:/build/psvr2-dxvk-src submodule update --init --recursive
git -C C:/build/psvr2-dxvk-src apply --check C:/patches/0001-retained-d3d11-timing-base.patch
git -C C:/build/psvr2-dxvk-src apply C:/patches/0001-retained-d3d11-timing-base.patch
git -C C:/build/psvr2-dxvk-src apply --check C:/patches/0002-recovered-dxvk-gaze-foveation.patch
git -C C:/build/psvr2-dxvk-src apply C:/patches/0002-recovered-dxvk-gaze-foveation.patch
meson setup C:/build/psvr2-dxvk-out C:/build/psvr2-dxvk-src --buildtype=release -Denable_d3d8=false -Denable_d3d9=false -Denable_d3d10=false -Denable_d3d11=true -Denable_dxgi=true -Db_ndebug=true
ninja -C C:/build/psvr2-dxvk-out -j 2
Get-FileHash C:/build/psvr2-dxvk-out/src/d3d11/d3d11.dll,C:/build/psvr2-dxvk-out/src/dxgi/dxgi.dll -Algorithm SHA256
```

The retained `version.h` defines `DXVK_VERSION "2.7.1"`.
Git can produce a different descriptive suffix through `git describe`.
Record that difference.
Do not falsify the version string.
PE timestamps, debug identities, paths and tool versions can also change the output hashes.

## Required runtime

| Component | Recorded identity |
|---|---|
| Phone | Rooted NX809J / RedMagic 11 Pro |
| Host kernel | `6.12.23-android16-OP-WILD` |
| Container | Linux AArch64 with glibc |
| Proton | `11.0 (ARM64)` |
| Execution route | Existing FEX/Wine Vulkan route |
| Vulkan loader | `1.4.341.0` |
| OpenComposite DLL | `caad2497d878b8fc03d3c48e33b947a2640da975e811d8d0a52d57cfe0cbe62e` |
| Monado source label | `7b5894b`, version `25.1.0` |
| Monado service | `3ef24813359089b851d399f08c817fd3db33e9b11c670921a15d86041d476cb7` |

Exact Proton and FEX build digests are not retained here.
OpenComposite source and package reconstruction remains a separate dependency.
The Monado service includes local SteamVR/Ignition, gaze and SR changes.
Stock Monado does not gain these changes from environment variables alone.
Its complete build and notice review remains a prerequisite for full-stack redistribution.

Use the owner's legally obtained game and existing driver setup.
The source package includes no Sony DLL, game asset, credential, runtime binary or proprietary payload.
New binary distributions need their own dependency and notice review.
The [package terms](PACKAGE-TERMS.md) define the original project scope.
Unchanged DXVK code retains its upstream terms.

## Game and compositor drivers

| Process | Mesa role | SHA-256 |
|---|---|---|
| Game | `c4365a5` container fork with KGSL timeout fixes | `248cd58786c7a4bc0fef6242bf97c6ef984621caeada7af6f39b618e2ee4f5dc` |
| Monado | KMS/GMEM display and queue-priority integration | `13f03707c59a9577813b7531e86861272ef9654017141e6e927e146505d26f8e` |

These identities match the Mesa R1 game and compositor libraries.
Use [Mesa R1's component instructions and notices](https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/guides/linux-container/docs/mesa.md).
Keep each ICD selection local to its process.
Do not replace Android or container system Vulkan libraries.
Mesa source/build reconstruction gaps remain in the component guide.

The DXVK path requires Vulkan dynamic rendering.
It also requires pipeline and attachment support for `VK_KHR_fragment_shading_rate`.
The retained Turnip review records 8x8 map texels and a maximum fragment size of 4x4 for A840.
Check the actual game ICD's features and properties during the diagnostic run.

Do not apply the separate experimental Turnip `0013/TU_FOVEATE` patch for this path.
`TU_DEBUG=gmem` is the saved preference.
The driver decides the actual pass placement.

## Shared records

The existing tracking bridge supplies gaze to Monado.
Monado projects the supplied gaze direction into the two eye views.
It writes the result to `/dev/shm/psvr2-gaze`.
DXVK must see the same inode through Wine's `Z:/dev/shm/psvr2-gaze` mapping.

| Record | Size | Little-endian layout |
|---|---|---|
| Gaze | 24 bytes | `u32 seq, valid; f32 u[2], v[2]` |
| Radius scale | 8 bytes | `u32 seq; f32 scale` |

The radius record is `/dev/shm/psvr2-fovea`.
The fields `u` and `v` hold normalized eye-view coordinates.
The [rendering note](https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/guides/foveated-rendering.md) describes the reader's behavior and limits.

## Export the settings

Merge [the game settings](skyrim-foveation.env.example) into the existing per-game environment.
The original launcher exported the assignments with this exact shell sequence:

```sh
set -a; . "$GAME_ENV"; set +a
```

Keep the recorded target sizes until a pass log identifies the required change.
The targets describe one Skyrim configuration, not universal PSVR2 dimensions.
The [Monado settings](monado-sr.env.example) require the already integrated service.
They do not install Monado or SGSR2.
Keep OpenComposite's `upscaler=monado` and projection-depth route.
Do not enable two upscale paths at the same time.

## Check gaze-to-map updates

This optional procedure records runtime gaze use.
The phone owner performs one bounded capture.
It is separate from a GPU-work benchmark.

### Prepare the diagnostic build

1. Preserve the current DLL pair and game environment.
2. Prepare a separate source copy with patches 0001 and 0002.
3. Apply optional patch 0003 to that copy.
4. Build the diagnostic DLL pair.
5. Record the new DLL hashes.
6. Set `DXVK_FOVEATION_LOG=1` for this run.
7. Set `DXVK_LOG_LEVEL=info` for this run.
8. Set `DXVK_FOVEATION_DEBUG=0` for this run.
9. Keep the saved targets, rates, SR settings and ICD selections.
10. Record the effective environment.

Patch 0003 is new diagnostic code, not part of the phone-tested pair.
It passed MSVC syntax checking with existing warnings.
The investigation did not link or run a new DLL.
Its trace runs only when `DXVK_FOVEATION_LOG=1`.
It logs at most once per second and 64 times per rendering thread.
It does not change the map algorithm.

### Capture one scene

1. Save the game ICD's full `vulkaninfo` fragment-shading-rate entries.
2. Include the extension, feature, format and property entries in that record.
3. Start one known static Skyrim scene.
4. Hold the headset position steady.
5. Look left for approximately five seconds.
6. Look at the center for approximately five seconds.
7. Look right for approximately five seconds.
8. Repeat that sequence once if needed.
9. Limit the complete capture to 30 seconds.
10. Sample the existing gaze record during this interval.
11. Do not overwrite the gaze record.
12. Save the DXVK log.
13. Stop after this capture.
14. Follow the [restore procedure](README.md#restore).

### Read the results

Check the log for these markers:

```text
Foveation: eye tracking from
Foveation: render pass ... -> foveated 1
Foveation audit:
```

Check that valid UV values and sequence values change.
Check that the uploaded-map signatures change with them.
Match the target and timing to the intended scene.
The pass selector uses dimensions, not the meaning of the game content.

The trace uses FNV-1a to identify map bytes queued for upload.
It is not a cryptographic provenance hash or a GPU readback.
Valid gaze changes, map changes and selected-pass binding establish the runtime command path for that capture.
Missing markers identify a producer, file-visibility, mapping, pass-selection or update problem.

Do not use the old debug dots to check tracked-map motion.
The code creates their rectangles only when it first creates a map.
It does not rebuild those rectangles as gaze moves.

## Compare GPU work

Phone foveation success and SGSR2 image improvement remain the observed results.
The records do not quantify GPU-work savings.
Actual hardware shading checks need a GPU capture, a readback or an invocation counter.

For a later comparison, keep these conditions the same:

- Scene and view.
- Resolution and output quality.
- GPU clock and thermal state.
- SR configuration.

Set `DXVK_FOVEATION=0` for the disabled case.
Restart the game after each configuration change.
DXVK reads its configuration once per process.
Compare compatible per-frame GPU times or fragment invocations.
Include the map-upload cost.
Do not infer reduced work from utilization alone or from mixed menu and overlay captures.

## Flow references

[OpenComposite's upstream description](https://gitlab.com/znixian/OpenOVR/-/raw/openxr/README.md) defines its OpenVR-to-OpenXR API role.
The saved project configuration selects its Monado upscale route and projection-depth submission.
The retained DXVK patch attaches shading-rate maps to selected rendering passes.
The matched Monado compositor reconstructs and sharpens the image before lens distortion.
The [display notes](https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/guides/linux-container/docs/device-and-dsc.md) describe the later DSC link.
