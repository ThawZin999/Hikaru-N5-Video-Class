import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.FIREBASE_CREDENTIALS) {
  console.error("Error: FIREBASE_CREDENTIALS environment variable is not set");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (error) {
  console.error("Error parsing FIREBASE_CREDENTIALS:", error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const usersCollection = db.collection("approvedUsers");

// ✅ Add user to Firestore
const addUser = async (userId) => {
  try {
    await usersCollection.doc(userId.toString()).set({ approved: true });
    console.log(`✅ User ${userId} added to Firestore`);
  } catch (error) {
    console.error("❌ Error adding user:", error);
  }
};

// ✅ Remove user from Firestore
const removeUser = async (userId) => {
  try {
    await usersCollection.doc(userId.toString()).delete();
    console.log(`❌ User ${userId} removed from Firestore`);
  } catch (error) {
    console.error("❌ Error removing user:", error);
  }
};

// ✅ Get all approved users
const getApprovedUsers = async () => {
  try {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map((doc) => Number(doc.id));
  } catch (error) {
    console.error("❌ Error getting approved users:", error);
    return [];
  }
};

export { db, usersCollection, addUser, removeUser, getApprovedUsers };
