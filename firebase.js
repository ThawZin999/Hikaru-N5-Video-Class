import admin from "firebase-admin";
import fs from "fs";

// Load Firebase credentials from the JSON key file
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase-adminsdk.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const usersCollection = db.collection("approvedUsers");

export { db, usersCollection };
