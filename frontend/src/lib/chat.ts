// Chat helper utilities for localStorage-backed conversations/messages
export function loadConversations(): any[] {
  const saved = localStorage.getItem('wibite_conversations');
  return saved ? JSON.parse(saved) : [];
}

export function saveConversations(convs: any[]) {
  localStorage.setItem('wibite_conversations', JSON.stringify(convs));
}

export function loadMessages(convId: number | string): any[] {
  const saved = localStorage.getItem(`wibite_msgs_${convId}`);
  return saved ? JSON.parse(saved) : [];
}

export function saveMessages(convId: number | string, msgs: any[]) {
  localStorage.setItem(`wibite_msgs_${convId}`, JSON.stringify(msgs));
}

export function createConversation(conversationStub: any, welcomeMsgs?: any[]): number {
  const convs = loadConversations();
  let convId = conversationStub.id || Date.now();

  const hasBothParticipantIds = conversationStub.donor_id !== undefined && conversationStub.receiver_id !== undefined;
  let existing: any | undefined;

  if (hasBothParticipantIds) {
    existing = convs.find((c: any) =>
      c.donor_id === conversationStub.donor_id &&
      c.receiver_id === conversationStub.receiver_id
    );
  } else if (conversationStub.donor_id !== undefined) {
    existing = convs.find((c: any) => c.donor_id === conversationStub.donor_id && c.receiver_id === undefined);
  } else if (conversationStub.receiver_id !== undefined) {
    existing = convs.find((c: any) => c.receiver_id === conversationStub.receiver_id && c.donor_id === undefined);
  }

  if (existing) return existing.id;

  const newConv = { ...conversationStub, id: convId };
  convs.unshift(newConv);
  saveConversations(convs);

  if (welcomeMsgs && (!loadMessages(convId) || loadMessages(convId).length === 0)) {
    saveMessages(convId, welcomeMsgs);
  }

  return convId;
}

export function createConversationFromFood(food: any, receiverId?: number | string): number {
  const donorId = food.donor_id || 1;
  const stub: any = {
    donor_id: donorId,
    name: food.donor_name || 'Donatur',
    role: 'Pendonor',
    time: 'Baru',
    lastMsg: `Tanya tentang donasi "${food.name}"`,
    unread: 0,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(food.donor_name || 'Donatur')}&background=10b981&color=fff`,
    foodName: food.name,
    foodImage: food.image || null
  };

  if (receiverId !== undefined && receiverId !== null) {
    stub.receiver_id = receiverId;
  }

  const welcomeMsgs = [
    { id: 1, senderId: donorId, text: `Halo! Terima kasih tertarik dengan donasi "${food.name}". Ada yang bisa saya bantu?`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), isMe: false }
  ];

  return createConversation(stub, welcomeMsgs);
}

export default {
  loadConversations,
  saveConversations,
  loadMessages,
  saveMessages,
  createConversation,
  createConversationFromFood
};