export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private animFrameId: number | null = null;

  private thresholdDb: number = -50;
  private silenceDurationMs: number = 2000;
  private onSilenceDetectedCallback: (() => void) | null = null;
  private isListening: boolean = false;

  constructor(thresholdDb: number = -50, silenceDurationMs: number = 2000) {
    this.thresholdDb = thresholdDb;
    this.silenceDurationMs = silenceDurationMs;
  }

  public async start(stream: MediaStream, onSilenceDetected: () => void) {
    this.stream = stream;
    this.onSilenceDetectedCallback = onSilenceDetected;
    this.isListening = true;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);

    this.monitorAudio();
  }

  private monitorAudio() {
    if (!this.analyser || !this.isListening) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate RMS amplitude
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);
    // Convert RMS to dBFS
    const db = rms > 0 ? 20 * Math.log10(rms / 255) : -100;

    if (db < this.thresholdDb) {
      if (!this.silenceTimer) {
        this.silenceTimer = setTimeout(() => {
          if (this.isListening && this.onSilenceDetectedCallback) {
            this.onSilenceDetectedCallback();
          }
        }, this.silenceDurationMs);
      }
    } else {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    }

    if (this.isListening) {
      this.animFrameId = requestAnimationFrame(() => this.monitorAudio());
    }
  }

  public stop() {
    this.isListening = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }
}
