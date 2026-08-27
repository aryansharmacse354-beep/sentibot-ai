class TTSController {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(text: string, locale: string = 'en-US', rate: number = 1.0) {
    if (!this.synth) return;

    // Cancel any ongoing playback instantly
    this.cancel();

    // Clean markdown or html tags from text before speaking
    const cleanText = text.replace(/[*_#`[\]()]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.lang = locale;

    // Find voice matching locale
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find((v) => v.lang.toLowerCase().includes(locale.toLowerCase().slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public cancel() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const ttsController = new TTSController();
