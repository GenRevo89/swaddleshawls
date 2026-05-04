/*
 * ulaw decoding logic taken from the wavefile library
 * https://github.com/rochars/wavefile/blob/master/lib/codecs/mulaw.js
 * USED BY @elevenlabs/client
 */

const decodeTable = [0, 132, 396, 924, 1980, 4092, 8316, 16764];

function decodeSample(muLawSample) {
  let sign;
  let exponent;
  let mantissa;
  let sample;
  muLawSample = ~muLawSample;
  sign = (muLawSample & 0x80);
  exponent = (muLawSample >> 4) & 0x07;
  mantissa = muLawSample & 0x0F;
  sample = decodeTable[exponent] + (mantissa << (exponent + 3));
  if (sign !== 0) sample = -sample;

  return sample;
}

class AudioConcatProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffers = [];
    this.cursor = 0;
    this.currentBuffer = null;
    this.wasInterrupted = false;
    this.finished = false;
    this.fraction = 0;
    this.sourceSampleRate = 16000;

    this.port.onmessage = ({ data }) => {
      switch (data.type) {
        case "setFormat":
          this.format = data.format;
          if (data.sampleRate) {
            this.sourceSampleRate = data.sampleRate;
          }
          break;
        case "buffer":
          this.wasInterrupted = false;
          this.buffers.push(
            this.format === "ulaw"
              ? new Uint8Array(data.buffer)
              : new Int16Array(data.buffer)
          );
          break;
        case "interrupt":
          this.wasInterrupted = true;
          break;
        case "clearInterrupted":
          if (this.wasInterrupted) {
            this.wasInterrupted = false;
            this.buffers = [];
            this.currentBuffer = null;
            this.cursor = 0;
            this.fraction = 0;
          }
      }
    };
  }

  getSample(buffer, index) {
    if (index >= buffer.length) return 0;
    let value = buffer[index];
    if (this.format === "ulaw") {
      value = decodeSample(value);
    }
    return value / 32768.0;
  }

  process(_, outputs) {
    const output = outputs[0][0];
    const ratio = this.sourceSampleRate / sampleRate;

    for (let i = 0; i < output.length; i++) {
      if (!this.currentBuffer) {
        if (this.buffers.length === 0) {
          output[i] = 0;
          this.finished = true;
          continue;
        }
        this.currentBuffer = this.buffers.shift();
        this.cursor = 0;
        this.finished = false;
      }

      const current = this.getSample(this.currentBuffer, this.cursor);
      let next = 0;
      if (this.cursor + 1 < this.currentBuffer.length) {
        next = this.getSample(this.currentBuffer, this.cursor + 1);
      } else {
        if (this.buffers.length > 0) {
          next = this.getSample(this.buffers[0], 0);
        } else {
          next = current;
        }
      }

      output[i] = current * (1 - this.fraction) + next * this.fraction;

      this.fraction += ratio;
      while (this.fraction >= 1) {
        this.fraction -= 1;
        this.cursor++;

        if (this.cursor >= this.currentBuffer.length) {
          this.currentBuffer = null;
          if (this.buffers.length > 0) {
            this.currentBuffer = this.buffers.shift();
            this.cursor = 0;
          } else {
            break;
          }
        }
      }
    }

    if (this.finished && this.buffers.length === 0 && !this.currentBuffer) {
      this.port.postMessage({ type: "process", finished: true });
    }

    return true;
  }
}

registerProcessor("audioConcatProcessor", AudioConcatProcessor);
