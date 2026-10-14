<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project documentation only; upstream components retain their own terms.
-->
# Eye-tracked foveation on the phone: implementation and evidence

I wanted the phone to spend less GPU work on detail away from where I'm looking. I tested eye-tracked foveation in Skyrim VR on my phone-hosted PSVR2 setup, and it worked for me. I also tested SGSR2 processing on the phone and found that it worked well and improved the image.

The source/build investigation now explains that DXVK path. The recovered gaze-enabled source is bound to the retained build, whose two output DLLs exactly match the saved phone-session DLLs. This resolves the earlier source mismatch. A retained pass-level gaze-movement trace and a controlled GPU-work comparison remain separate evidence gaps.

## What runs where

| Path | Implementation | Evidence and scope |
|---|---|---|
| Recovered gaze-enabled DXVK | Reads Monado's gaze record, updates fragment-shading-rate maps, and attaches them to selected Skyrim graphics passes. | Phone success confirmed by AstroPC. All 15 altered source files match compiler-embedded SHA-256 records; retained output hashes match both saved DLLs, and PE/PDB identities agree. This is a retained source/build binding, not a fresh byte-identical rebuild. |
| Monado compositor / SGSR2 | The inspected source places fuller SGSR2 reconstruction around gaze, uses cheaper spatial upscaling outside it, blends the transition, then applies AMD FSR1 RCAS sharpening. | AstroPC tested SGSR2 on the phone and found improved image quality. That observation is distinct from measuring GPU-work reduction or proving the exact gaze-to-map behavior of each game pass. |
| Separate Turnip `TU_FOVEATE` proposal | A fixed radial fragment-density-map experiment through selected GMEM passes. | This proposal is unbuilt and is not required for the recovered DXVK path. It must not replace the gaze-enabled DXVK patch in reproduction instructions. |

The older fixed-center DXVK prototype and its retained PC readback test are historical inputs. They do not describe the complete phone-tested implementation. The recovered source includes the later gaze reader and map updates.

## From the eyes to selected game passes

Monado's gaze bridge projects the supplied gaze direction into each eye's view and writes a shared record. DXVK accesses that record through Wine's file mapping, reads valid per-eye coordinates and uses them to move the detailed region of a fragment-shading-rate map. Invalid gaze falls back to configured lens-center defaults.

The map is attached through [Vulkan fragment shading rate](https://docs.vulkan.org/refpages/latest/refpages/source/VK_KHR_fragment_shading_rate.html). It lets selected areas share shading work across multiple pixels. The modified DXVK selects passes using configured render-target dimensions and attachment properties. That is a heuristic: it is not a semantic understanding of Skyrim's scene. Unmatched targets, compute dispatches and depth-only shadow passes do not qualify through that gate.

The implementation also reads a separate radius-scale record from Monado. Its controller uses frame-submission intervals and head motion to adjust the zones. Those control inputs are not an isolated measurement of GPU execution time.

The shared gaze record is 24 bytes: little-endian `uint32 seq, valid; float u[2], v[2]`. It holds two eye-view projections of the supplied gaze direction; it does not establish independently transported directions for both eyes. The retained reader has no timestamp freshness check or coherent sequence snapshot. Those implementation limits are preserved in the recovered patch rather than silently repaired during reproduction.

## SGSR2, sharpening and Mesa have different jobs

The game-side DXVK path changes shading rate in selected game passes. Monado's SGSR2 path instead reconstructs an already rendered image, then applies sharpening. I found that SGSR2 improved the picture in the phone setup. That qualitative result is accepted as a test result; it is not a numerical image-quality score or a measured shading-work saving.

The matched compositor source uses a fuller temporal inner zone, a cheaper spatial outer zone and a blended transition, followed by AMD RCAS. Game shading-rate maps and compositor upscaling zones use different coordinate normalizations. Their presence together does not prove exact geometric alignment.

The saved app and compositor Turnip identities match the [published Mesa R1 pair](linux-container/docs/mesa.md). Mesa supplies the underlying graphics/display support; the recovered DXVK integration supplies the gaze-to-shading-rate-map path. The separate experimental `TU_FOVEATE` fragment-density-map proposal is not a prerequisite. Streaming and recording helpers are also separate from this rendering mechanism.

## What the recovered evidence establishes

The retained build is DXVK 2.7.1, based on upstream commit [`a6764047e587178283fcde4073ae6e1410af594f`](https://github.com/doitsujin/dxvk/commit/a6764047e587178283fcde4073ae6e1410af594f), with the retained timing delta and recovered gaze-foveation changes. The outputs are Windows x64 DLLs used through the container's Proton/FEX route, not native Android/Bionic libraries.

The audit matched all 15 altered source files to SHA-256 records embedded in retained compiler objects. Both output DLLs match the saved phone-session hashes, and both PE CodeView identities match their PDB GUID/age pairs. The original patches replay cleanly against the upstream base and reproduce those altered inputs after line-ending normalization. This binds the recovered changes to retained build artifacts; it does not promise identical binaries from a new toolchain run or exhaustively checksum every unmodified dependency.

| Saved phone-session artifact | SHA-256 |
|---|---|
| `d3d11.dll` | `ed41a52873bc060463d33a9affe48f501236b966a5637a66ecd6ee75495b4ac4` |
| `dxgi.dll` | `abca767a0842e3f20aa0e6c05f5f5fe24f4b1bee460d27d4fb106b1842b0e1d1` |
| Matched compositor source, `comp_psvr2_sr.c` | `6f28164b2c21ac9375697a744e1d71859f0440b2966fce583eb32ac190d8d27d` |

These are identity records. This note does not distribute those binaries or any Sony/game payload.

## Source patches and reproduction

The [readable source package](../research/dxvk-gaze/README.md) provides the two recovered patches, exact upstream base, dependency/toolchain records, settings examples, rollback instructions and portable provenance metadata. A third patch is optional new trace instrumentation, not part of the phone-tested build. The [source-only ZIP](../research/dxvk-gaze/psvr2-dxvk-gaze-source-20261014-r1.zip?raw=true) contains those text files and scoped notices. It contains no DLL, Sony/game asset or private log, and is not a complete runtime installer.

## The remaining runtime and GPU-work checks

The user's successful phone testing and observed SGSR2 improvement are part of the evidence. The remaining runtime capture is a matching session that correlates valid changing gaze, selected-pass binding and changing map payloads queued for upload. The old debug dots are generated when a map is first created and are not rebuilt as gaze moves; they cannot establish tracked map movement.

The intended game-rendering benefit is fewer peripheral fragment-shader invocations while retaining a detailed inner region. It does not remove geometry or CPU work. Quantifying the benefit needs a controlled comparison with the same scene, view, render-target size, image settings, compositor configuration and GPU operating conditions, with relevant shader-work counters or comparable GPU timings. Map-update overhead must be included.

A lower utilization percentage alone can reflect changed clocks, waiting or starvation. It does not establish less work or lower energy consumption. Earlier queue-priority/pipelining observations are a different experiment and are not foveation savings.

## Scope and credit

This is a custom integration in the Linux-container route. The native Android route still needs its own implementation and qualification. Reusing ideas on Steam Frame remains untested compatibility.

AstroPC's integration includes the gaze transport, DXVK injection and local stack configuration. It builds on [Monado](https://monado.freedesktop.org/), [DXVK](https://github.com/doitsujin/dxvk), [Mesa/Turnip](https://www.mesa3d.org/), Khronos Vulkan/OpenXR, [Qualcomm Snapdragon Game Super Resolution](https://github.com/SnapdragonGameStudios/snapdragon-gsr), and [AMD FidelityFX FSR/RCAS](https://github.com/GPUOpen-Effects/FidelityFX-FSR). Their algorithms, source, credits and licenses remain separate. This is not a claim that upstream DXVK or stock Monado supplies the complete phone setup.
