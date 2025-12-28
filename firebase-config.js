// Firebase Configuration for Amrut Landing Page
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjsPDcYzObBISbqaztQwlYrRh5C3FI7_M",
    authDomain: "amrut-landing-page.firebaseapp.com",
    projectId: "amrut-landing-page",
    storageBucket: "amrut-landing-page.firebasestorage.app",
    messagingSenderId: "382434375710",
    appId: "1:382434375710:web:0546b37a48007d62a2960f",
    measurementId: "G-DSP36N286Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Collection names
const COLLECTIONS = {
    ENGLISH: 'leads_english',
    MARATHI: 'leads_marathi',
    ADMIN_SETTINGS: 'admin_settings'
};

const ADMIN_DOC_ID = 'credentials';

// ============================================
// ADMIN AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Check if admin password has been set up
 * Returns true if password exists in Firestore, false otherwise
 */
async function isAdminSetup() {
    try {
        const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() && docSnap.data().passwordHash;
    } catch (error) {
        console.error('Error checking admin setup:', error);
        return false;
    }
}

/**
 * Set up admin password for the first time
 * Stores hashed password in Firestore
 */
async function setupAdminPassword(password) {
    try {
        const passwordHash = await hashPassword(password);
        
        const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        await setDoc(docRef, {
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        return true;
    } catch (error) {
        console.error('Error setting up admin password:', error);
        return false;
    }
}

/**
 * Verify admin password
 */
async function verifyAdminPassword(password) {
    try {
        const passwordHash = await hashPassword(password);
        
        const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().passwordHash === passwordHash) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error verifying admin password:', error);
        return false;
    }
}

/**
 * Change admin password (requires current password verification)
 */
async function changeAdminPassword(currentPassword, newPassword) {
    try {
        const currentHash = await hashPassword(currentPassword);
        
        const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists() || docSnap.data().passwordHash !== currentHash) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        const newHash = await hashPassword(newPassword);
        await updateDoc(docRef, {
            passwordHash: newHash,
            updatedAt: new Date().toISOString()
        });
        
        return { success: true, message: 'Password changed successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, message: 'Error changing password' };
    }
}

/**
 * Simple hash function using SHA-256
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_amrut_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if admin is currently logged in
 */
function isAdminLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

/**
 * Logout admin
 */
function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
}

// ============================================
// LEAD MANAGEMENT FUNCTIONS
// ============================================

/**
 * Save a new lead to the database
 */
async function saveLead(leadData, language = 'english') {
    const collectionName = language === 'marathi' ? COLLECTIONS.MARATHI : COLLECTIONS.ENGLISH;
    
    const lead = {
        ...leadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'new',
        language: language
    };
    
    try {
        const docRef = await addDoc(collection(db, collectionName), lead);
        return docRef.id;
    } catch (error) {
        console.error('Error saving lead:', error);
        throw error;
    }
}

/**
 * Get all leads from a specific collection
 */
async function getLeads(language = 'english') {
    const collectionName = language === 'marathi' ? COLLECTIONS.MARATHI : COLLECTIONS.ENGLISH;
    
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const leads = [];
        querySnapshot.forEach((docSnap) => {
            leads.push({ id: docSnap.id, ...docSnap.data() });
        });
        return leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error getting leads:', error);
        return [];
    }
}

/**
 * Update an existing lead
 */
async function updateLead(leadId, updates, language = 'english') {
    const collectionName = language === 'marathi' ? COLLECTIONS.MARATHI : COLLECTIONS.ENGLISH;
    
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    try {
        const docRef = doc(db, collectionName, leadId);
        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating lead:', error);
        throw error;
    }
}

/**
 * Delete a lead
 */
async function deleteLead(leadId, language = 'english') {
    const collectionName = language === 'marathi' ? COLLECTIONS.MARATHI : COLLECTIONS.ENGLISH;
    
    try {
        const docRef = doc(db, collectionName, leadId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting lead:', error);
        throw error;
    }
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

window.FirebaseDB = {
    // Admin auth
    isAdminSetup,
    setupAdminPassword,
    verifyAdminPassword,
    changeAdminPassword,
    isAdminLoggedIn,
    adminLogout,
    
    // Lead management
    saveLead,
    getLeads,
    updateLead,
    deleteLead,
    
    // Constants
    COLLECTIONS
};

console.log('🔥 Firebase initialized successfully for Amrut Landing Page');
