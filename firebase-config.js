// Firebase Configuration - Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase - Uncomment these lines after adding your config
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
// import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

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
        // Uncomment for Firebase
        // const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        // const docSnap = await getDoc(docRef);
        // return docSnap.exists() && docSnap.data().passwordHash;
        
        // localStorage placeholder
        const adminData = localStorage.getItem('admin_credentials');
        return adminData !== null;
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
        // Simple hash function (for production, use proper hashing like bcrypt on server)
        const passwordHash = await hashPassword(password);
        
        // Uncomment for Firebase
        // const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        // await setDoc(docRef, {
        //     passwordHash: passwordHash,
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString()
        // });
        
        // localStorage placeholder
        localStorage.setItem('admin_credentials', JSON.stringify({
            passwordHash: passwordHash,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
        
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
        
        // Uncomment for Firebase
        // const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        // const docSnap = await getDoc(docRef);
        // if (docSnap.exists() && docSnap.data().passwordHash === passwordHash) {
        //     sessionStorage.setItem('adminLoggedIn', 'true');
        //     return true;
        // }
        // return false;
        
        // localStorage placeholder
        const adminData = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
        if (adminData.passwordHash === passwordHash) {
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
        // First verify current password
        const currentHash = await hashPassword(currentPassword);
        
        // Uncomment for Firebase
        // const docRef = doc(db, COLLECTIONS.ADMIN_SETTINGS, ADMIN_DOC_ID);
        // const docSnap = await getDoc(docRef);
        // if (!docSnap.exists() || docSnap.data().passwordHash !== currentHash) {
        //     return { success: false, message: 'Current password is incorrect' };
        // }
        // const newHash = await hashPassword(newPassword);
        // await updateDoc(docRef, {
        //     passwordHash: newHash,
        //     updatedAt: new Date().toISOString()
        // });
        
        // localStorage placeholder
        const adminData = JSON.parse(localStorage.getItem('admin_credentials') || '{}');
        if (adminData.passwordHash !== currentHash) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        const newHash = await hashPassword(newPassword);
        adminData.passwordHash = newHash;
        adminData.updatedAt = new Date().toISOString();
        localStorage.setItem('admin_credentials', JSON.stringify(adminData));
        
        return { success: true, message: 'Password changed successfully' };
    } catch (error) {
        console.error('Error changing password:', error);
        return { success: false, message: 'Error changing password' };
    }
}

/**
 * Simple hash function using SHA-256
 * For production, use proper server-side hashing with bcrypt
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
        // Uncomment for Firebase
        // const docRef = await addDoc(collection(db, collectionName), lead);
        // return docRef.id;
        
        // localStorage placeholder
        const leads = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const id = 'lead_' + Date.now();
        lead.id = id;
        leads.push(lead);
        localStorage.setItem(collectionName, JSON.stringify(leads));
        return id;
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
        // Uncomment for Firebase
        // const querySnapshot = await getDocs(collection(db, collectionName));
        // const leads = [];
        // querySnapshot.forEach((doc) => {
        //     leads.push({ id: doc.id, ...doc.data() });
        // });
        // return leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // localStorage placeholder
        const leads = JSON.parse(localStorage.getItem(collectionName) || '[]');
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
        // Uncomment for Firebase
        // const docRef = doc(db, collectionName, leadId);
        // await updateDoc(docRef, updateData);
        
        // localStorage placeholder
        const leads = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const index = leads.findIndex(l => l.id === leadId);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...updateData };
            localStorage.setItem(collectionName, JSON.stringify(leads));
        }
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
        // Uncomment for Firebase
        // const docRef = doc(db, collectionName, leadId);
        // await deleteDoc(docRef);
        
        // localStorage placeholder
        const leads = JSON.parse(localStorage.getItem(collectionName) || '[]');
        const filtered = leads.filter(l => l.id !== leadId);
        localStorage.setItem(collectionName, JSON.stringify(filtered));
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
