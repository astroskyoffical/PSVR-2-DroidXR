# DRM leasing: who owns the headset display

GPU rendering access and display authority are different. A DRM render node allows rendering without granting the connector/CRTC/plane control needed to scan out a headset image. A lease grants a client control over selected display objects; the lessor retains authority. These distinctions follow the [Linux DRM userspace API](https://docs.kernel.org/gpu/drm-uapi.html).

## Recovered implementation

The recovered production broker source has SHA-256 `ca202a1f906f69a1edec2fec17f6e3932021b359ef8253ea61993cc900914ff6`. Its source/license and deployed binary relationship still need release resolution; the source and binary are not bundled here. This page describes the inspected implementation, rather than the separate experimental lease prototypes.

```mermaid
sequenceDiagram
    participant H as Android HWC/composer
    participant B as Root host psvr2-lease serve
    participant C as Container psvr2-lease run
    participant M as Monado + custom Turnip
    H->>B: Existing card0 master FD duplicated via pidfd_getfd
    B->>B: Select DP connector, CRTC and planes; CREATE_LEASE
    B->>C: AF_UNIX socket, SCM_RIGHTS lease FD
    C->>C: dup2 to FD 3; TU_KGSL_DISPLAY_FD=3
    C->>M: exec monado-service with inherited lease
    M->>M: VK_KHR_display presentation on leased objects
    B->>B: On stop signal: REVOKE_LEASE and unlink socket
```

| Part | Exact recovered role |
|---|---|
| Lessor | Android composer/HWC process holding `/dev/dri/card0` DRM master |
| Host broker | Finds that process/FD, duplicates the master with `pidfd_open` / `pidfd_getfd`, then creates the lease |
| Connector | First connected physical DisplayPort connector found through DRM resources |
| CRTC | Encoder's current CRTC, or compatible CRTC fallback |
| Planes | Explicit CLI objects if supplied; otherwise up to two free compatible primary planes |
| Lease socket | Host rootfs path ending `/var/tmp/psvr2-lease.sock`; container sees `/var/tmp/psvr2-lease.sock` |
| FD handoff | One lease FD sent using `sendmsg` / `SCM_RIGHTS`, received and duplicated to **FD 3** |
| Compositor consumer | Monado launched with `TU_KGSL_DISPLAY_FD=3`; custom Turnip uses that FD for `VK_KHR_display` |
| Render access | Headless desktop/apps separately use KGSL/render-node access; the saved desktop selects `/dev/dri/renderD128` |

The broker is a static AArch64 Linux/glibc program used on both sides. Running that host helper on Android does not make the container runtime Bionic-native. The source hardcodes `/dev/dri/card0` and an operator-specific rootfs path. The public `${CONTAINER_ROOTFS}` convention describes the required configuration; it does not make the historical broker configurable. Its source must be adapted, rebuilt and tested before a different rootfs can be claimed to work. See [path configuration](paths-and-configuration.md).

The broker clears mutable blob properties of leased planes before handing them out. It does not perform the CRTC modeset at that stage. The launcher then lets Monado/custom Mesa present. The saved configuration uses `WSI_DISPLAY_SPLIT=1`, with two 2000-pixel-wide planes for the 4000×2040 mode.

## Android handoff and restoration

The host launcher disables the selected Android external **logical display** before the lease. Android's internal screen and HWC remain running. The source notes that powering off the external display instead allowed Android to re-enable it on wake and conflict with the runtime; the recovered launcher uses `cmd display disable-display` rather than treating a power toggle as a lease.

The lessor retains control; a lease does not guarantee that HWC cannot interfere with the leased objects. The recorded arrangement depends on this device's plane selection and external-display handoff. On SIGTERM/SIGINT/SIGHUP, the broker revokes the lease and unlinks its socket. The launcher's cleanup returns the external output to Android. See [restore limits](verify-and-restore.md).

## Evidence and limits

The preserved plane file contains `97 129`. It is a historical explicit plane selection, not a portable connector/CRTC/plane tuple. A matching PSVR2 lease log establishing the complete selected tuple is still missing from this release review. Object IDs from an earlier desktop-monitor experiment must not be substituted.

The recovered socket is mode `0666` and the source contains no peer-credential check. This is a device-specific historical broker, not a reviewed multi-user service. The review makes no access/security changes and does not offer it as a generic installer.

OpenXR composition layers, Android SurfaceFlinger layers and DRM/KMS planes have different roles. A desktop panel can be an OpenXR layer; a pair of KMS planes is the display scanout arrangement. A screenshot or running process proves neither lease ownership nor what the wearer sees. Use one headset display owner and verify the complete presentation path under [the controlled sequence](verify-and-restore.md).
