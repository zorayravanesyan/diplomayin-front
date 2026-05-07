import { apiRequest } from './httpClient.js';

export async function getRandomDietRecommendations() {
  const data = await apiRequest('/diet/random', { method: 'GET' });
  return {
    bmi: data.bmi ?? null,
    age: data.age ?? null,
    recommendations: data.data ?? [],
  };
}
