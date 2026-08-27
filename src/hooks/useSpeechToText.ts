'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceActivityDetector } from '@/lib/vadService';

interface UseSpeechToTextProps {
  onSpeechEnd?: (transcript: string) => void;
  language?: string;
}

export function useSpeechToText({ onSpeechEnd, language = 'en-US' }: UseSpeechToTextProps = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setError(event.error);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError('Speech recognition not supported in this browser.');
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    }

    if (vadRef.current) {
      vadRef.current.stop();
      vadRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setIsListening(false);

    if (transcript.trim() && onSpeechEnd) {
      onSpeechEnd(transcript.trim());
    }
  }, [isListening, transcript, onSpeechEnd]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');

    if (!recognitionRef.current) {
      setError('Speech recognition unavailable.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Initialize Voice Activity Detection (VAD)
      const vad = new VoiceActivityDetector(-50, 2000);
      vadRef.current = vad;
      vad.start(stream, () => {
        // Auto stop on 2.0s silence
        stopListening();
      });

      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setError('Could not access microphone.');
      setIsListening(false);
    }
  }, [stopListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
