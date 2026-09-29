import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default configuration with safe fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoEduMonitorKey_Placeholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edumonitor-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edumonitor-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edumonitor-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demoedumonitor"
};

// Initialize Firebase App safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Simple Reactive Broadcast Channel for Multi-Tab / Dual-Browser Instant Realtime Sync in Demo Mode
class LocalRealtimeBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('edumonitor_realtime_sync');
      this.channel.onmessage = (event) => {
        const { topic, payload } = event.data;
        if (this.listeners.has(topic)) {
          this.listeners.get(topic)?.forEach(callback => callback(payload));
        }
      };
    }
  }

  publish(topic: string, payload: any) {
    if (this.channel) {
      this.channel.postMessage({ topic, payload });
    }
    // Also trigger locally in current window
    if (this.listeners.has(topic)) {
      this.listeners.get(topic)?.forEach(callback => callback(payload));
    }
  }

  subscribe(topic: string, callback: (payload: any) => void) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)?.add(callback);

    return () => {
      this.listeners.get(topic)?.delete(callback);
    };
  }
}

export const realtimeBus = new LocalRealtimeBus();
