# Verify and restore the provisioned baseline

This is an operational reference for the already provisioned, matching device. The full fresh-install path remains gated by [missing source and artifacts](licenses-and-provenance.md). The release inventory itself did not run these commands or start a hardware session.

## Before a session

Resolve the [container, account and installation paths](paths-and-configuration.md) first. The Android `/data/local/tmp/psvr2/psvr2.sh` location below is the recovered host-script layout, not a personal home directory or proof that the script is installed on your phone.

1. Match the host model/kernel and component digests in [the manifest](../manifest.json). Keep originals and private room/calibration state backed up.
2. Resolve both custom Mesa ICDs and the Linux OpenXR runtime manifest to the intended libraries. Record the actual loaded driver/renderer during the eventual session; a configuration file alone is insufficient.
3. Confirm physical USB and DisplayPort enumeration, the matching DSC configuration and input visibility. Keep another compositor from owning the headset output.
4. Review the launcher's persistent settings and incomplete restore behavior described below. A public installer must resolve that gap before advertising a reversible one-button install.

The recorded Android-root launcher interface for status is:

```sh
sh /data/local/tmp/psvr2/psvr2.sh status
```

It reports container/display/USB/process/socket markers. It does not establish tracking, hardware acceleration or visible frames.

## Controlled start and checks

For the original provisioned setup, the recovered session commands are:

```sh
sh /data/local/tmp/psvr2/psvr2.sh on
sh /data/local/tmp/psvr2/psvr2.sh status
```

`on` performs the device-specific actions documented on [the launcher page](linkdoctor-and-launchers.md). It is not a generic installation command. Preserve a separate result for each of these checks:

| Check | Observable pass | Insufficient evidence |
|---|---|---|
| Display handoff | Expected DP connector/CRTC/planes leased; runtime presents; Android internal screen remains usable | Lease process name alone |
| Graphics | Actual process uses the intended hardware driver and custom display ICD | ICD API string; a software-capable desktop starting |
| OpenXR | Client discovers the intended Linux runtime/service and submits a scene | Socket alone |
| Head tracking | Device geometry and meaningful physical motion agree, with validity/quality recorded separately | Plausible pose values or fabricated flags |
| Presentation | Wearer sees correctly placed stereo scene and comfortable scale | Offscreen render, screenshot or mirror alone |
| Sense/gaze | Separate real input, optical pose and calibration checks pass | Pairing or raw values alone |

A wearer session needs an agreed purpose, duration, actions, pass/fail observations and stop conditions. Bundle related checks and wait for readiness. Stop for discomfort, display conflict, device loss or instability. Release review did not certify these physical checks anew.

## Stop and restore

The original setup's stop command is:

```sh
sh /data/local/tmp/psvr2/psvr2.sh off
sh /data/local/tmp/psvr2/psvr2.sh status
```

The cleanup stops its Linux runtime/bridge/desktop processes, terminates the lease broker, re-enables/resets the Android external logical display, and restores its saved fan value. Confirm the lease is revoked and Android gets the external output back; a process exit by itself is insufficient.

**Known incomplete restoration:** `on` denies the GameAssist overlay app-op, and `off` does not restore its previous value. Performance-profile changes and permissive node recreation also need their original-state inventory. No restore command is guessed here. A future installer must either avoid those actions or restore the exact prior state through an approved, tested method.

Stopping the session does not remove the boot DSC module, uninstall LinkDoctor, delete the container or restore a replaced graphics/runtime binary. For a component rollback, restore its preserved files and configuration together. Do not treat this session cleanup as a full uninstall procedure.
