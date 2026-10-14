<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project documentation only; upstream components retain their own terms.
-->
# Foveated rendering: what I tried, and what is verified

I want the phone to spend less GPU work on detail away from where I'm looking. Eye tracking supplies a position; rendering software has to turn that position into a useful quality decision. A moving gaze overlay alone does not establish that the game shaded less of the image.

This note separates source-inspected experiments from the reported working phone-hosted Skyrim run. The working libraries are being matched to implementation source. Older prototype files are not a complete account of that run. The completed audit does not yet supply a quantified, comparable GPU-workload result.

## Three different places to change the work

| Path | What the inspected artifacts do | Qualification |
|---|---|---|
| Experimental Turnip `TU_FOVEATE` | Proposes fixed radial fragment-density-map foveation through the GMEM path for selected dynamic color-and-depth passes. | This proposal is unbuilt and has no Adreno 840 phone test. It does not follow gaze. The audit does not bind it to released R1. |
| Experimental DXVK | The source-reviewed prototype builds `VK_KHR_fragment_shading_rate` attachment maps with radial rate rings on matching eye render targets, with a fixed `DXVK_FOVEATION_CENTER`. This does not identify the exact phone-tested revision. | Tested on the phone in AstroPC's setup, as confirmed by AstroPC. A retained PC readback test is also documented; matching the phone-tested binary to its exact source revision and patch set is in progress. |
| Monado compositor / SGSR2 | The inspected source receives per-eye gaze coordinates, puts fuller SGSR2 processing around them, uses cheaper spatial upscaling outside that area, blends the transition, then applies AMD FSR1 RCAS sharpening. | AstroPC tested SGSR2 in the phone setup and found that it improved image quality. Source and saved configuration/logs also document the gaze-centered path. The observed quality improvement is separate from measuring GPU-work reduction or binding the exact tested build and live-gaze behavior to source. |

The [released Mesa R1 documentation](linux-container/docs/mesa.md) describes the graphics/display route and installation checks. It does not document a foveation implementation or bind these proposals to its packaged drivers. That documentation gap does not settle every capability of the working stack.

## Shading, upscaling and streaming are separate

[Fragment shading rate](https://docs.vulkan.org/refpages/latest/refpages/source/VK_KHR_fragment_shading_rate.html) and [fragment density maps](https://docs.vulkan.org/refpages/latest/refpages/source/VK_EXT_fragment_density_map.html) can let one shading calculation cover multiple pixels in selected areas. That is the intended mechanism for reducing peripheral fragment-shader work in the rendering prototypes.

Upscaling reconstructs a larger output from an image that has already been rendered. Sharpening changes the resulting image's appearance. The compositor experiment redistributes its upscaling work; that does not by itself show that the game executed fewer fragment-shader invocations. The source inspection identifies those operations separately, even when they appear in one display pipeline.

Streaming encodes and transports an image. A foveated stream, a sharper picture, or lower network traffic is not evidence that the game's renderer did less shading. The separate Quest streaming example does not qualify these phone-rendering experiments.

## The live-gaze link still needs matching source

The reviewed Monado bridge generates `HmdDevice::set_gaze` code that writes per-eye UV coordinates. The compositor reads that channel to position its upscaling zones. Saved configuration enables this route, and a saved Monado log records gaze-tracking initialization and the configured SGSR2 pass. I also tested SGSR2 on the phone and found that it worked well and improved the image. That is my observed image-quality result; the exact tested source version, gaze-path binding and measured GPU-work reduction remain separate questions.

The DXVK libraries captured from a saved Skyrim session have different hashes from the reviewed fixed-center prototype. They contain a `DXVK_FOVEATION_GAZE` string. Matching implementation source and a per-pass/live-gaze trace are being investigated; the string is a clue, rather than a complete explanation of the loaded code. The reviewed prototype's limitations must not be assigned to those different working libraries.

I reported a good worn-headset experience with eye tracking and foveation, and improved image quality with SGSR2 on the phone. Those test results remain part of the project evidence. Source/binary matching and controlled GPU-work measurements are the next parts needed to explain the exact implementation and quantify its workload benefit.

## What it could bring, and how to check it

The rendering prototypes aim to reduce peripheral shader invocations while keeping a detailed inner region. That could leave more GPU capacity for the rest of the scene. It does not remove geometry or CPU work. The compositor approach instead explores where to spend image-reconstruction work. The completed review has not yet source-linked a comparable GPU-workload saving to the working phone session.

A useful comparison needs the same scene, view, render-target size, image settings, presentation target and GPU operating conditions. Verify which passes received the rate/density map, then compare relevant shader-work counters or GPU execution timings with the feature enabled and disabled. For gaze-following behavior, also verify that valid per-eye gaze actually moves the active region.

A lower utilization percentage alone can reflect changed clocks, waiting or starvation. It does not establish less work or lower energy consumption. Earlier queue-priority/pipelining observations are a different experiment and are not foveation savings.

## Scope and credit

This research belongs to the Linux-container route. The native Android route still needs its own integration and qualification. Reusing ideas on Steam Frame is a possibility, not tested compatibility; fixed-center methods and gaze-following methods have different input requirements.

AstroPC's integration work builds on [Monado](https://monado.freedesktop.org/), [DXVK](https://github.com/doitsujin/dxvk), [Mesa/Turnip](https://www.mesa3d.org/), Khronos Vulkan/OpenXR, [Qualcomm Snapdragon Game Super Resolution](https://github.com/SnapdragonGameStudios/snapdragon-gsr), and [AMD FidelityFX FSR/RCAS](https://github.com/GPUOpen-Effects/FidelityFX-FSR). The underlying techniques are upstream work, not an invention claim. Their source, credits and licenses remain separate. No experimental patch, proprietary driver or binary is added by this note.

<details>
<summary>Inspected artifact identities</summary>

These identify private audit inputs; this page does not publish their source or establish their identity with a loaded session.

| Audit input | SHA-256 |
|---|---|
| Turnip `TU_FOVEATE` proposal | `29f2ef26ff3354c934cafe2a12bbb02f71635f5842090340e5ba4282e386ea7e` |
| DXVK fixed-center prototype patch | `bde53bc0a0d0c466ea3004e897e2dc4b3a67ef6cf7746b8bd7519653ebfead7f` |
| Gaze bridge generator, `monado-steamvr-driver.py` | `63b044e3ebeefb8d252c1e5d2c74a10cc2dce27b6be6ef6fc92cbdab289d8af5` |
| Compositor source, `comp_psvr2_sr.c` | `6f28164b2c21ac9375697a744e1d71859f0440b2966fce583eb32ac190d8d27d` |

</details>
