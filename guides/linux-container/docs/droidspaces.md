# Droidspaces and the Linux container

## What and why

[Droidspaces-OSS](https://github.com/ravindu644/Droidspaces-OSS) is the required reference route for this method. Credit and installation instructions belong to the [official project](https://www.droidspaces.org/). A container shares the Android host kernel; it does not provide another kernel for an incompatible DSC module.

The recorded Android app is **6.3.0 / version code 6300**. The [v6.3.0 release](https://github.com/ravindu644/Droidspaces-OSS/releases/tag/v6.3.0) is the version reference, rather than whatever version the website currently offers. The deployed backend SHA-256 is recorded in [the manifest](../manifest.json); its source-to-binary match remains unverified.

## Installation evidence

The existing container is named `AnLandKDE`, at:

```text
/data/local/Droidspaces/Containers/AnLandKDE/rootfs
```

Its actual `/usr/lib/os-release` identifies **Ubuntu 26.04 LTS (Resolute Raccoon)**. `/etc/os-release` resolves to that file. Installed package records identify `arm64`; the phone kernel reports AArch64. The label `AnLandKDE` does not establish KDE, a distro, or an image origin.

| Saved setting | Value |
|---|---|
| Android storage | disabled |
| Termux X11 | disabled |
| virgl | disabled |
| PulseAudio | disabled |
| Hardware access | enabled |
| GPU mode | enabled |
| SELinux permissive | disabled |
| Custom init | `/root/desktop-doctor/bin/desktop-doctor-container-init.sh` |
| Environment file | `/data/local/Droidspaces/Containers/AnLandKDE/desktop-doctor.env` |
| Mesa loader override | `kgsl` |

The preserved host launcher enters the container through:

```sh
/data/local/Droidspaces/bin/droidspaces --name=AnLandKDE run /bin/bash /root/psvr2/psvr2-c.sh status
```

This read-only status example uses the recovered wrapper syntax. The host launcher supplies `session`, `desktop`, `status` and other defined actions.

**Fresh-install gap:** the original rootfs download/source, archive digest, exact image creation recipe and full package/source notices have not been recovered. Installing another Ubuntu image is not evidence that it reproduces this one. No rootfs is distributed here.

## Verify

Compare the OS identity, architecture and saved settings before changing them. Confirm the configured init scripts and GPU device access exist. The package inventory includes distro Mesa `26.0.3-1ubuntu1` and Vulkan loader `1.4.341.0-1`; the headset route selects separate custom Mesa libraries. Those distro packages do not identify the custom driver.

## Restore

Keep the original container and configuration backed up before replacement. Stopping the PSVR2 launcher is distinct from deleting or resetting the container. The release review made no configuration changes and supplies no unverified image conversion or reset command. Alternative container managers remain untested.
