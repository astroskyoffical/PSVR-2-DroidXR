<!-- Copyright (C) 2026 AstroPC (astroskyoffical)
SPDX-License-Identifier: GPL-3.0-only -->
# Quest streaming setup and network notes

AstroPC's Quest 3 test used a modified WiVRn client, USB Ethernet and the headset's Wi-Fi switched off. The game streamed through the local wired connection. This is a compressed network-video route; PSVR2's direct display-driver route is a different part of the project. Credit for the streaming foundation belongs to [WiVRn](https://github.com/WiVRn/WiVRn).

The [journal player](https://astroskyoffical.github.io/PSVR-2-DroidXR/?v=journal-20#quest-experiment) preserves the original 1080p recording. It starts muted at 4x, with native controls and a 1x option for the recorded pace. The original file is served directly by Pages without reencoding.

## Network and privacy work

Quest continues to run its operating system and tracking software. A local wired stream gives control over the streaming link; reviewing network isolation and telemetry is separate work. Ethernet can provide Internet access, and software can retain data for a later sync. Exact host identity, latency, outgoing traffic and later synchronization behavior have not been measured for this recording.

The project goal is understandable local operation and clear network choices. Device firmware, drivers, games and services remain part of the software stack to inspect. No claim of completed privacy isolation is made for this test.
