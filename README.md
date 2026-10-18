<!--
Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only
Original project contributions only; see LICENSE-SCOPE.md. Third-party material retains its own terms.
-->

PSVR-2-DroidXR
SUPPORT DROIDXR DEVELOPMENT — DONATE ON KO-FI
DroidXR is a free, independent project that I fund out of my own pocket. Reverse engineering, AI-assisted research, hardware prototypes, and constant testing are getting expensive. If you like what I'm building and want to help me keep going, you can support development on Ko-fi.
Donations are completely optional, with no paywall or promise of early access. Every contribution helps cover development costs while I work toward a public, reproducible release.
[!WARNING]
WORK IN PROGRESS — NOT READY FOR GENERAL USE
This repository has not yet been updated to reflect my current development progress. What is published today is an older, incomplete snapshot of experiments, recovered configurations, technical notes, and selected components—not a finished release or a complete installer.
Some pages describe approaches I used earlier, including an Ignition/Wine-based Linux route. They do not necessarily describe my current implementation. GitHub commit dates show when I published these records, not when I began working on DroidXR.
Please do not treat the current documentation as a verified, end-to-end setup guide. I'm updating the source, build instructions, testing evidence, dependencies, and attribution as the project moves toward a reproducible release.

What is DroidXR?
I already had a PSVR 2 I liked. I wanted to keep its OLED screens and eye tracking, move the computing to my phone, and get away from the cable running back to a PC. That's DroidXR.
My wider goal is to make wired VR headsets more useful with mobile hardware, using open software wherever possible. PSVR 2 is the starting point, not the end goal.
Previously reported development result: I have run Skyrim VR from my rooted RedMagic phone through a Linux-container setup connected to PSVR 2, with eye tracking, eye-tracked DXVK foveation, and SGSR2 processing. Those are results from my own testing of that particular setup; this repository does not currently provide everything needed for someone else to reproduce them.
See the demonstration and development journal.
Important distinction: published history vs. current development
The public records cover several experiments and approaches. They are not a complete picture of my current progress.
- Earlier Linux-container route: Droidspaces, Mesa/Turnip, Monado, and an Ignition/Wine-based tracking bridge appear in the saved configuration. This is a historical arrangement, not a description of every newer implementation.
- Native Android route: I am developing a separate Android-native approach. The [currently published native progress record](guides/native-android.md) covers earlier image/head-follow testing and does not yet reflect all subsequent development.
- Broader goals: More portable headset support, controller integration, rendering optimizations, PCVR compatibility, and simpler custom hardware are ongoing development—not finished public releases.
I'll update these sections as corresponding source, build details, and repeatable tests are ready to publish. Until then, don't assume a feature is publicly available just because I've discussed or demonstrated it.
How the earlier Linux-container setup works
The recorded Android display app prepares the headset connection. Droidspaces hosts a Linux workspace on the phone. Custom Mesa/Turnip builds render through the phone GPU, while Monado provides the OpenXR runtime and headset integration. A display lease lets Linux drive PSVR 2 while Android retains its phone screen.
In the recorded game route, gaze data reaches modified DXVK to control foveation in selected Skyrim rendering passes. SGSR2 is a separate image-reconstruction step. This describes the earlier tested configuration; it is not a guarantee that the currently released components can recreate the full experience.
- [DXVK gaze patches and build notes](research/dxvk-gaze/README.md)
- [Foveated-rendering explanation and technical records](guides/foveated-rendering.md)
- Mesa/Turnip component release and [component notes](guides/linux-container/docs/mesa.md)
I also tested a separate Quest 3 streaming route using a modified WiVRn client and USB Ethernet. The journal recording and [network notes](guides/quest-streaming.md) document that experiment; they are not a packaged streaming product.
What is actually available here?
Component	Public status
Website, technical notes, recorded configuration, and DXVK gaze patches	Published; some material describes older experiments.
Custom Mesa/Turnip component	A separate, limited component release is available, with checksums, installer, and notices. It is not a full headset installer; independent clean source rebuild remains unverified.
Production PSVR 2 DSC kernel module	Not distributed. Matching production source and build configuration remain unrecovered in the published records.
Modified Monado runtime	Exact modified source, patches, build options, and matching binary provenance remain unresolved in the public package; no full runtime release here.
LinkDoctor, display broker, and other integration pieces	Not provided as a complete reproducible package. Some source-to-installed-build and licensing details remain unresolved.
Newer native Android implementation	Not yet released or fully documented here. Current development progress is ahead of the published notes.


See [release/provenance status](guides/linux-container/docs/licenses-and-provenance.md), the [public manifest](guides/linux-container/manifest.json), and [license scope](LICENSE-SCOPE.md) for the exact publication limits.
A working demonstration, a component download, and a reproducible release are three different things. I want to be clear about which is which.
What's next
- Update the repository: Bring the documentation into line with current development, and publish the matching source/build details and appropriate third-party credits where redistribution is permitted.
- Native Android: Continue runtime, controller, gaze, performance, and reliability work, with repeatable tests rather than relying on demos alone.
- Simpler setup: Develop a portable adapter/hub and a more straightforward setup process.
- Broader support: Explore additional wired headsets and VR apps after the core PSVR 2 route is documented and reproducible.
There is no public-ready release date being promised here.
Historical reference setup
These are identities recorded for the older Linux-container baseline, not hardware requirements for every future DroidXR implementation.
Component	Recorded reference
Phone	NX809J / RedMagic; Android 16, API 36; AArch64
Kernel	6.12.23-android16-OP-WILD
Container manager	Droidspaces, Android app 6.3.0 / code 6300
Container OS	Ubuntu 26.04 LTS, ARM64
Android display app	Historical project build, 1.0.0-preview / code 100
Graphics	Separate custom Turnip libraries for apps and compositor
Runtime	Linux Monado and the historical tracking/compatibility bridge



Historical technical notes — not a ready-to-run installer
The following links document the saved configuration and outstanding requirements. They are engineering references, not a complete installation procedure.
1. [Device, kernel, and DSC requirements](guides/linux-container/docs/device-and-dsc.md)
2. [Droidspaces and container notes](guides/linux-container/docs/droidspaces.md) and [paths/configuration](guides/linux-container/docs/paths-and-configuration.md)
3. [Display app and launcher records](guides/linux-container/docs/linkdoctor-and-launchers.md), [Mesa](guides/linux-container/docs/mesa.md), and [Monado/tracking](guides/linux-container/docs/monado-and-input.md)
4. [Display leasing](guides/linux-container/docs/drm-leasing.md) and [verification/restore](guides/linux-container/docs/verify-and-restore.md)
5. [DXVK gaze patches](research/dxvk-gaze/README.md) and [optional app notes](guides/linux-container/docs/optional-test-apps.md)
Don't flash experimental kernel modules or replace working system libraries based on these notes. Obtain proprietary drivers and games through authorized sources.
Credits and upstream work
DroidXR builds on substantial existing work from the Linux, Android, open-source graphics, and VR communities. My contribution is the phone-hosted concept, integration, experiments, and ongoing Android and hardware development—not a claim to have created the upstream software.
Special thanks to:
- iVRy / Mediator Software for PSVR 2 reverse-engineering research and shared DSC findings that helped make headset display work possible.
- Monado and its contributors for the open-source OpenXR runtime.
- lfdevs / mesa-for-android-container for the Android-container Mesa work underlying the recorded driver source lineage, alongside the upstream Mesa/Turnip contributors.
- PSVR2Toolkit and Ignition for work used in the historical Linux compatibility route.
- Droidspaces, DXVK, OpenXR, WiVRn, Qualcomm SGSR2, AMD FSR/RCAS, and their respective contributors.
AI tools have assisted extensively with research, code analysis, reverse-engineering work, and debugging. They have been tools within a developer-directed project, not a replacement for integration, testing, or crediting the projects that made this possible.
I want to make the project useful to others, and proper credit and reproducible work are part of getting there.
License and community
Forks and contributions are welcome. The GPL-3.0-only grant applies only to the original project code and documentation portions identified in [LICENSE-SCOPE.md](LICENSE-SCOPE.md)—not the entire headset stack. See LICENSE, NOTICE, and each upstream component's terms. Third-party code, proprietary dependencies, and future hardware designs are not automatically covered by this repository's GPL grant.
DroidXR is an independent community project, not affiliated with or endorsed by Sony Interactive Entertainment, Meta, Valve, or any other referenced vendor. Trademarks belong to their respective owners.
