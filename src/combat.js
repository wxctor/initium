import { rtdb } from './firebase';
import { ref, set, onValue, update } from 'firebase/database';

// Inicializar sala de combate
export function createCombatRoom(roomId, initialState) {
  return set(ref(rtdb, `rooms/${roomId}`), initialState);
}

// Escutar mudanças em tempo real
export function listenCombat(roomId, callback) {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  return onValue(roomRef, (snap) => {
    callback(snap.val());
  });
}

// Mover token
export function moveToken(roomId, tokenId, x, y) {
  return update(
    ref(rtdb, `rooms/${roomId}/tokens/${tokenId}`),
    { x, y }
  );
}

// Próximo turno
export function nextTurn(roomId, currentTurn, total) {
  return update(ref(rtdb, `rooms/${roomId}`), {
    currentTurn: (currentTurn + 1) % total
  });
}
