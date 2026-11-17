// Beat engine. Two sources:
//   "clock":  a metronome at the active set's BPM
//   "listen": onset detection on whatever the visitor is playing. Browsers never let a
//             page hear system audio silently, so we ask: screen/tab share with audio
//             (Chrome/Edge; Windows can share system audio, macOS a playing tab), falling
//             back to the microphone hearing the speakers (works everywhere).
// The scene reads `beat.pulse` (1 on a hit, decaying to 0) every frame.
export function createBeat() {
  const beat = { mode: "off", source: null, bpm: 124, pulse: 0, level: 0, count: 0, onBeat: null, onEnd: null };
  let phase = 0, ctx = null, analyser = null, data = null, stream = null, avg = 0, lastHit = 0;

  function hit(now) {
    beat.pulse = 1;
    beat.count++;
    lastHit = now;
    beat.onBeat?.(beat);
  }

  beat.update = (now, dt) => {
    if (beat.mode === "clock") {
      const ph = ((now / 1000) * beat.bpm / 60) % 1;
      if (ph < phase) hit(now);
      phase = ph;
    } else if (beat.mode === "listen" && analyser) {
      analyser.getByteFrequencyData(data);
      // kick drum lives roughly in 40-160 Hz: the first few bins at fftSize 1024
      let sum = 0;
      for (let i = 1; i < 5; i++) sum += data[i];
      const low = sum / (4 * 255);
      beat.level = low;
      avg = avg * 0.94 + low * 0.06;
      const floor = beat.source === "mic" ? 0.12 : 0.25;
      if (low > avg * 1.25 && low > floor && now - lastHit > 260) hit(now);
    }
    beat.pulse *= Math.exp(-dt * 6.5);
  };

  beat.useClock = (on) => {
    release();
    beat.mode = on ? "clock" : "off";
  };

  // Ask for the visitor's music. Resolves to "system" | "mic"; throws if both are refused.
  beat.listen = async () => {
    release();
    const raw = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
    let source = "system";
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: raw, systemAudio: "include", selfBrowserSurface: "exclude" });
      // we only want the sound; keep the share alive but drop the picture
      stream.getVideoTracks().forEach((t) => (t.enabled = false));
      if (!stream.getAudioTracks().length) throw new Error("share had no audio");
    } catch {
      stream?.getTracks().forEach((t) => t.stop());
      source = "mic";
      stream = await navigator.mediaDevices.getUserMedia({ audio: raw });
    }
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    await ctx.resume();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.5;
    data = new Uint8Array(analyser.frequencyBinCount);
    // analyse only: never route back to the speakers (no echo)
    ctx.createMediaStreamSource(stream).connect(analyser);
    stream.getTracks().forEach((t) => t.addEventListener("ended", () => { if (beat.mode === "listen") { beat.stop(); beat.onEnd?.(); } }));
    beat.mode = "listen";
    beat.source = source;
    return source;
  };

  function release() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    analyser = null;
    beat.source = null;
  }
  beat.stop = () => { release(); beat.mode = "off"; };

  return beat;
}
