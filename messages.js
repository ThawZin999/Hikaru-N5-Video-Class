import { db } from "./firebase.js";

const messagesCollection = db.collection("messages");

// Add message IDs for a specific category
const addMessageIds = async (category, messageIds) => {
  try {
    await messagesCollection.doc(category).set({ messageIds });
    console.log(`✅ Message IDs added for ${category}`);
  } catch (error) {
    console.error(`❌ Error adding message IDs for ${category}:`, error);
    throw error;
  }
};

// Get message IDs for a specific category
const getMessageIds = async (category) => {
  try {
    const doc = await messagesCollection.doc(category).get();
    if (!doc.exists) {
      console.log(`⚠️ No message IDs found for ${category}`);
      return [];
    }
    return doc.data().messageIds;
  } catch (error) {
    console.error(`❌ Error getting message IDs for ${category}:`, error);
    throw error;
  }
};

// Update message IDs for a specific category
const updateMessageIds = async (category, messageIds) => {
  try {
    await messagesCollection.doc(category).update({ messageIds });
    console.log(`✅ Message IDs updated for ${category}`);
  } catch (error) {
    console.error(`❌ Error updating message IDs for ${category}:`, error);
    throw error;
  }
};

// Delete message IDs for a specific category
const deleteMessageIds = async (category) => {
  try {
    await messagesCollection.doc(category).delete();
    console.log(`✅ Message IDs deleted for ${category}`);
  } catch (error) {
    console.error(`❌ Error deleting message IDs for ${category}:`, error);
    throw error;
  }
};

export { addMessageIds, getMessageIds, updateMessageIds, deleteMessageIds };
