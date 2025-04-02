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

const addUser = async (userId) => {
  await usersCollection.doc(userId.toString()).set({ approved: true });
  console.log(`✅ Added user ${userId} to Firestore`);
};

const removeUser = async (userId) => {
  await usersCollection.doc(userId.toString()).delete();
  console.log(`❌ Removed user ${userId} from Firestore`);
};

// ✅ Get all approved users
const getApprovedUsers = async () => {
  const snapshot = await usersCollection.get();
  return snapshot.docs.map((doc) => Number(doc.id));
};

export { db, usersCollection, addUser, removeUser, getApprovedUsers };
