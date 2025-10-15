import * as tf from '@tensorflow/tfjs';
import { supabase } from '../integrations/supabase/client';

export class MoodPredictor {
  private model: tf.Sequential | null = null;

  async trainModel(userData: any[]) {
    // Convert user data to tensors
    const inputs = tf.tensor2d(userData.map(d => [
      d.sleepHours,
      d.activityLevel,
      d.socialInteractions,
      d.stressLevel,
      d.previousMood
    ]));

    const labels = tf.tensor2d(userData.map(d => [d.currentMood]));

    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [5], units: 10, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError'
    });

    try {
      await this.model.fit(inputs, labels, {
        epochs: 100,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      });

      // Clean up tensors
      inputs.dispose();
      labels.dispose();

      return true;
    } catch (error) {
      console.error('Error training model:', error);
      return false;
    }
  }

  async predictMood(userData: any) {
    if (!this.model) {
      throw new Error('Model not trained');
    }

    const input = tf.tensor2d([[
      userData.sleepHours,
      userData.activityLevel,
      userData.socialInteractions,
      userData.stressLevel,
      userData.previousMood
    ]]);

    const prediction = this.model.predict(input) as tf.Tensor;
    const result = await prediction.data();

    // Clean up tensors
    input.dispose();
    prediction.dispose();

    return result[0];
  }
}