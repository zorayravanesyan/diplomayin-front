import { apiRequest } from './httpClient.js';

export async function listStickerPacks() {
  const data = await apiRequest('/stickers/packs', { method: 'GET' });
  return data.packs ?? [];
}

export async function getStickerPack(packId) {
  return apiRequest(`/stickers/packs/${packId}`, { method: 'GET' });
}

export async function listAllStickers() {
  const data = await apiRequest('/stickers/all', { method: 'GET' });
  return data.stickers ?? [];
}
