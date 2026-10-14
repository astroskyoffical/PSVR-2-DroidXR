<!-- Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original documentation only; upstream components retain their own terms. -->
# Recovered DXVK gaze foveation: source patches and reproduction

This source-only package documents the implementation behind the saved, phone-tested Skyrim VR DXVK DLLs. The user confirms phone foveation success and that the associated SGSR2 processing improved the image. This is a custom integration for an existing working PSVR2 Linux-container stack, not a complete phone installer. No Sony DLL, game asset, credential, runtime binary or proprietary payload is included.

## What to apply

1. `0001-retained-d3d11-timing-base.patch`: the pre-existing opt-in timing instrumentation underlying the recorded build. Included for source fidelity; timing is disabled unless `DXVK_INTEROP_TIMING=1`.
2. `0002-recovered-dxvk-gaze-foveation.patch`: the actual retained 14-file foveation implementation, including gaze and radius-scale readers. This supersedes the stale fixed-center prototype for reproducing the saved session.
3. `0003-OPTIONAL-new-gaze-map-trace.patch`: **new diagnostic code authored for this investigation**, not part of the original session. Apply only to a separate diagnostic build. It logs at most once a second and 64 records per rendering thread, only when `DXVK_FOVEATION_LOG=1`. It does not change the map algorithm.

The two original patches apply cleanly to upstream DXVK commit `a6764047e587178283fcde4073ae6e1410af594f`. All 15 altered input files match SHA-256 checksums in the retained compiler objects. The recorded original outputs are:

```text
ed41a52873bc060463d33a9affe48f501236b966a5637a66ecd6ee75495b4ac4  d3d11.dll
abca767a0842e3f20aa0e6c05f5f5fe24f4b1bee460d27d4fb106b1842b0e1d1  dxgi.dll
```

Source changes are local alterations to DXVK; do not describe them as upstream DXVK support. Preserve `LICENSE-DXVK.txt` and dependency notices when distributing source or newly built binaries. The upstream zlib notice is retained verbatim. Original project-authored changes and original documentation are scoped in [PACKAGE-TERMS.md](PACKAGE-TERMS.md); unchanged upstream code retains its terms. Full binary redistribution review is outside this source-only package.

## Recreate the source/build

Use a fresh checkout and output directory. The recorded build was Windows **x64** Release with MSVC 19.44.35228, linker 14.44.35228.0, Windows SDK 10.0.26100.0, Python 3.11, Meson 1.12.1, Ninja 1.12.1 and the retained `glslang-16.6.0` tool. Exact Python patch version and a clean deterministic rebuild are not established.

Submodules recorded at:

| Path | Commit |
|---|---|
| `include/native/directx` | `9df86f2341616ef1888ae59919feaa6d4fad693d` |
| `include/spirv` | `04f10f650d514df88b76d25e83db360142c7b174` |
| `include/vulkan` | `5d94bb4dcc968cccce1f601324fcaf3eda92a52b` |
| `subprojects/dxbc-spirv` | `fe5a4ef1e99357c8b9f57e4cfb1195c3dae9707f` |
| `subprojects/libdisplay-info` | `275e6459c7ab1ddd4b125f28d0440716e4888078` |

Place the patch files in `C:/patches`. In a developer shell with the listed tools already available, use fresh, short generic paths and compare `git submodule status --recursive` against the pins above before building:

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

The original generated `version.h` says `DXVK_VERSION "2.7.1"`. A Git checkout's `git describe` may produce a different descriptive suffix. Record that difference rather than falsifying it. PE timestamps, debug identities, path layout and toolchain details can also change output hashes. The checks above prove patch replay and original source/build linkage; they do not promise byte-identical rebuilt DLLs. The optional diagnostic TU passed MSVC syntax checking, but no new DLL was linked or tested here.

## Existing runtime required

The saved environment is rooted NX809J/RedMagic 11 Pro, Linux AArch64 glibc container, Android kernel `6.12.23-android16-OP-WILD`, with Proton `11.0 (ARM64)`, the existing FEX/Wine Vulkan path and OpenComposite. Exact Proton/FEX build digests are not pinned by this handoff. The saved OpenComposite DLL hash is `caad2497d878b8fc03d3c48e33b947a2640da975e811d8d0a52d57cfe0cbe62e`; its full source/packaging reconstruction remains a separate dependency. Use the user's legally obtained game and existing driver/runtime setup.

Required Vulkan behavior is dynamic rendering plus both pipeline and attachment `VK_KHR_fragment_shading_rate`. The retained Turnip review advertises 8×8 map texels and up to 4×4 fragments for A840; check the actual app ICD's features/properties in the confirmation run. The observed stack uses Vulkan loader 1.4.341.0 and these two different Mesa libraries:

| Process | Mesa role | Original SHA-256 |
|---|---|---|
| Game | c4365a5 container fork + KGSL timeout fixes | `248cd58786c7a4bc0fef6242bf97c6ef984621caeada7af6f39b618e2ee4f5dc` |
| Monado | KMS/GMEM display + queue-priority integration | `13f03707c59a9577813b7531e86861272ef9654017141e6e927e146505d26f8e` |

These are the Mesa R1 app/compositor hashes. Use the [reviewed Mesa R1 component and its notices](https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/guides/linux-container/docs/mesa.md) with isolated ICD selection. Mesa source/build reconstruction gaps remain as documented there; this package does not close them. Do not apply experimental Turnip `0013/TU_FOVEATE` as a prerequisite. `TU_DEBUG=gmem` is the saved preference; actual pass placement is a driver decision, not established by that environment variable alone. Do not replace Android or container system Vulkan libraries.

The gaze producer must publish the 24-byte `{u32 seq, valid; f32 u[2], v[2]}` record to the same `/dev/shm/psvr2-gaze` inode visible through Wine's `Z:/dev/shm/psvr2-gaze`. The 8-byte radius record is `{u32 seq; f32 scale}` at `/dev/shm/psvr2-fovea`. The retained Monado source is labeled `7b5894b`, declares version 25.1.0 and includes local SteamVR/Ignition, gaze and SR changes. The matching service hash is `3ef24813359089b851d399f08c817fd3db33e9b11c670921a15d86041d476cb7`. Stock Monado plus these environment variables does not create the missing integration. Its complete build/notice closure is a separate prerequisite for full-stack redistribution.

## Install and rollback, by the phone owner

These are instructions, not actions performed in this investigation. Coordinate once through the existing phone owner; keep the active headset session under that owner’s control.

1. Stop the game through its existing launcher. Save `d3d11.dll`, `dxgi.dll`, game environment and selected ICD JSONs to a new backup directory; record their SHA-256 hashes. Preserve the current Monado/runtime state. Do not install into a running process.
2. Copy the intended pair of newly built x64 DLLs into the game's directory, or retain the already matched original pair when merely reconstructing provenance. Keep the existing native-DLL overrides for D3D11/DXGI. Record installed hashes and verify the next process actually maps that pair and the app ICD.
3. Integrate `skyrim-foveation.env.example` into the existing per-game environment. The original launcher exported assignments using `set -a; . "$GAME_ENV"; set +a`. Keep the game and compositor ICD selection separate. The target size list is from the recorded Skyrim configuration; a different render size must be identified from pass logs before editing it.
4. `monado-sr.env.example` records the separate compositor settings for an already integrated service. It does not install SGSR2 or Monado. Preserve the existing OpenComposite `upscaler=monado`/projection-depth route; avoid unintentionally enabling two upscale paths.
5. To disable DXVK foveation for a later controlled comparison, use `DXVK_FOVEATION=0` **and restart the game**; configuration is read once per process. To roll back installation, stop the game, restore both backed-up DLLs and the backed-up environment/ICD selection, then verify restored hashes and relaunch through the original launcher. Restore diagnostic log settings too. No deletion of the original backups is needed.

## One bounded owner-run confirmation

Purpose: close the missing runtime gaze-to-selected-pass evidence. It is not a performance benchmark.

- Prepare a separate diagnostic build with optional patch 0003, preserving the original pair and environment. For this run only, set `DXVK_FOVEATION_LOG=1`, `DXVK_LOG_LEVEL=info`, `DXVK_FOVEATION_DEBUG=0`. Keep the saved target sizes, rates, SR settings and ICDs. Record all resulting hashes and effective environment.
- On that same app ICD, save the full `vulkaninfo` fragment-shading-rate extension, feature, format and property entries. Start one known static Skyrim scene. With head position steady, look left, center and right for roughly five seconds each, repeating once if needed: at most 30 seconds of capture. Sample the existing 24-byte gaze record over that interval without overwriting it.
- Save DXVK logs showing `Foveation: eye tracking from`, selected `Foveation: render pass ... -> foveated 1`, and new `Foveation audit:` lines with valid changing UVs/sequence and changing map signatures. Those signatures are a lightweight FNV-1a identifier of map bytes queued for upload, not a cryptographic provenance hash or GPU readback. Match the recorded target and timing to the intended scene; the pass gate is dimension-based. Stop after this one capture and restore the originals.
- Acceptance is valid gaze changes correlated with changed map payloads plus selected-pass binding on the expected app ICD. Missing lines localize the blocker to producer/visibility, mapping, pass selection or update. This demonstrates the runtime command path; proving actual hardware shading reduction would additionally require a GPU capture/readback or invocation counter. Do not treat the existing debug-dot overlay as tracked-map evidence: its rectangles are only generated on first map creation.

No quantitative gain is claimed. If GPU-work benefit is later measured, use the same scene, resolution, output quality, clock/thermal state and SR configuration with foveation on/off, measure comparable per-frame GPU timestamps or fragment invocations, and account for map-upload overhead. Utilization alone and mixed menu/overlay captures cannot establish a reduction. The user's successful phone testing and observed SGSR2 image improvement remain valid qualitative evidence.

## Source evidence and package scope

[provenance.json](provenance.json) records portable source and output identities. [SHA256SUMS.txt](SHA256SUMS.txt) covers the text payload. The original two patches reproduce all 15 altered compiler inputs; the optional third patch is separate diagnostic code, syntax-checked only. No new phone test or clean binary rebuild was performed for this publication. [The public rendering note](https://github.com/astroskyoffical/PSVR-2-DroidXR/blob/main/guides/foveated-rendering.md) explains the resolved source binding, confirmed phone results and remaining runtime/GPU-work checks.
