// Sound effects utility
class SoundEffects {
  constructor() {
    this.rightAnswerSound = new Audio("/assets/audio/right answer SFX.wav");
    this.wrongAnswerSound = new Audio("/assets/audio/wrong answer SFX.wav");

    // Preload sounds
    this.rightAnswerSound.preload = "auto";
    this.wrongAnswerSound.preload = "auto";

    // Set volume
    this.rightAnswerSound.volume = 0.7;
    this.wrongAnswerSound.volume = 0.7;
  }

  playRightAnswer() {
    try {
      this.rightAnswerSound.currentTime = 0;
      this.rightAnswerSound.play().catch((error) => {
        console.warn("Could not play right answer sound:", error);
      });
    } catch (error) {
      console.warn("Sound effect error:", error);
    }
  }

  playWrongAnswer() {
    try {
      this.wrongAnswerSound.currentTime = 0;
      this.wrongAnswerSound.play().catch((error) => {
        console.warn("Could not play wrong answer sound:", error);
      });
    } catch (error) {
      console.warn("Sound effect error:", error);
    }
  }

  setVolume(volume) {
    this.rightAnswerSound.volume = volume;
    this.wrongAnswerSound.volume = volume;
  }
}

// Create singleton instance
const soundEffects = new SoundEffects();

export default soundEffects;
