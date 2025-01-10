import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useSelector } from 'react-redux';

const AudioEffectsProcessor = ({ wavesurfer, trackId }) => {
  const effectsRef = useRef({
    reverb: null,
    noiseGate: null,
    gainNode: null,
    source: null
  });

  const track = useSelector(state => 
    state.audio.tracks.find(t => t.id === trackId)
  );

  // Debug function
  const logEffectStatus = () => {
    const effects = effectsRef.current;
    console.log('Effects Status:', {
      trackId,
      reverbConnected: effects.reverb?.connected,
      reverbWet: effects.reverb?.wet.value,
      reverbDecay: effects.reverb?.decay.value,
      noiseGateConnected: effects.noiseGate?.connected,
      noiseGateThreshold: effects.noiseGate?.threshold.value,
      gainConnected: effects.gainNode?.connected,
      gainValue: effects.gainNode?.gain.value,
      sourceConnected: effects.source?.numberOfOutputs > 0
    });
  };

  const cleanupEffects = () => {
    console.log(`Cleaning up effects for track ${trackId}`);
    const { reverb, noiseGate, gainNode, source } = effectsRef.current;
    if (source) {
      try {
        source.disconnect();
        console.log('Source disconnected successfully');
      } catch (e) {
        console.error('Error disconnecting source:', e);
      }
    }
    if (reverb) {
      reverb.dispose();
      console.log('Reverb disposed');
    }
    if (noiseGate) {
      noiseGate.dispose();
      console.log('Noise gate disposed');
    }
    if (gainNode) {
      gainNode.dispose();
      console.log('Gain node disposed');
    }
    
    effectsRef.current = {
      reverb: null,
      noiseGate: null,
      gainNode: null,
      source: null
    };
  };

  useEffect(() => {
    if (!wavesurfer || !track) {
      console.log('Missing wavesurfer or track data', { wavesurfer: !!wavesurfer, trackId });
      return;
    }

    const initializeEffects = async () => {
      if (!wavesurfer.backend?.media) {
        console.error('WaveSurfer media not ready');
        return;
      }

      console.log('Initializing effects for track', trackId);
      cleanupEffects();

      try {
        // Ensure Tone.js is running
        await Tone.start();
        console.log('Tone.js context started:', Tone.context.state);

        // Create effects chain
        const reverb = new Tone.Reverb({
          decay: track.effects.reverb.decay,
          wet: track.effects.reverb.wet
        });
        console.log('Reverb created with settings:', {
          decay: track.effects.reverb.decay,
          wet: track.effects.reverb.wet
        });

        const noiseGate = new Tone.Gate({
          threshold: track.effects.noiseCancellation.threshold,
          attack: track.effects.noiseCancellation.attack,
          release: track.effects.noiseCancellation.release
        });
        console.log('Noise Gate created with settings:', {
          threshold: track.effects.noiseCancellation.threshold,
          attack: track.effects.noiseCancellation.attack,
          release: track.effects.noiseCancellation.release
        });

        const gainNode = new Tone.Gain(1);

        // Generate reverb impulse response
        await reverb.generate();
        console.log('Reverb impulse response generated');

        // Create and connect the source
        const mediaElement = wavesurfer.backend.media;
        const source = Tone.context.createMediaElementSource(mediaElement);
        console.log('Media element source created');

        // Connect the effects chain
        if (track.effects.reverb.enabled) {
          source.connect(noiseGate);
          noiseGate.connect(reverb);
          reverb.connect(gainNode);
          gainNode.toDestination();
          console.log('Effects chain connected with reverb');
        } else {
          source.connect(noiseGate);
          noiseGate.connect(gainNode);
          gainNode.toDestination();
          console.log('Effects chain connected without reverb');
        }

        effectsRef.current = {
          reverb,
          noiseGate,
          gainNode,
          source
        };

        logEffectStatus();

      } catch (error) {
        console.error('Error in effects initialization:', error);
        cleanupEffects();
      }
    };

    if (!wavesurfer.isReady) {
      wavesurfer.once('ready', initializeEffects);
      console.log('Waiting for wavesurfer ready event');
    } else {
      initializeEffects();
    }

    return () => {
      cleanupEffects();
    };
  }, [wavesurfer, track?.id]);

  // Update effect parameters when they change
  useEffect(() => {
    if (!track || !effectsRef.current.reverb || !effectsRef.current.noiseGate) {
      console.log('Skip effects update - missing dependencies');
      return;
    }

    const { reverb, noiseGate } = effectsRef.current;
    console.log('Updating effects parameters:', {
      reverbEnabled: track.effects.reverb.enabled,
      reverbDecay: track.effects.reverb.decay,
      reverbWet: track.effects.reverb.wet,
      noiseGateEnabled: track.effects.noiseCancellation.enabled,
      noiseGateThreshold: track.effects.noiseCancellation.threshold
    });

    try {
      // Update reverb parameters
      if (track.effects.reverb.enabled) {
        reverb.set({
          decay: track.effects.reverb.decay,
          wet: track.effects.reverb.wet
        });
      } else {
        reverb.wet.value = 0;
      }

      // Update noise gate parameters
      if (track.effects.noiseCancellation.enabled) {
        noiseGate.set({
          threshold: track.effects.noiseCancellation.threshold,
          attack: track.effects.noiseCancellation.attack,
          release: track.effects.noiseCancellation.release
        });
      } else {
        noiseGate.threshold.value = -100;
      }

      logEffectStatus();
    } catch (error) {
      console.error('Error updating effects parameters:', error);
    }
  }, [track?.effects]);

  return null;
};

export default AudioEffectsProcessor;