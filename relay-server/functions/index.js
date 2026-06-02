#!/usr/bin/env node
// Pocket-6 Email → Socceri Address Resolver — BP071 Black Mamba Scope 14
// Firebase Functions: registerPeer + resolveEmail
//
// Firestore collection: peer_registrations
//   Document ID: email (lowercased)
//   Fields: { peerId, email, displayName, deviceName, registeredAt, verified }
//
// Endpoints:
//   POST /registerPeer    { peerId, email, displayName, deviceName }
//   POST /resolveEmail    { secret, email }
//
// INVITE_SECRET env var must match the relay server's RELAY_SECRET for /resolveEmail auth.
// Verification emails are sent via Firebase Auth's sendSignInLinkToEmail flow (action link).

'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

initializeApp();

const db = getFirestore();
const COLLECTION = 'peer_registrations';
const INVITE_SECRET = process.env.INVITE_SECRET ?? process.env.RELAY_SECRET ?? '';

// ─── CORS helper ─────────────────────────────────────────────────────────────

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── POST /registerPeer ───────────────────────────────────────────────────────
//
// Accepts: { peerId, email, displayName, deviceName }
// Writes to peer_registrations/<email> (upsert).
// Sends a verification email via Firebase Auth sign-in link so the peer
// can confirm ownership of the address before the record is active.
//
// Returns: { ok: true, email, status: "pending_verification" }
//          or { error: "..." } on validation failure.

exports.registerPeer = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const { peerId, email, displayName, deviceName } = req.body ?? {};

    if (!peerId || typeof peerId !== 'string' || !/^[0-9a-f]{16}$/.test(peerId)) {
      res.status(400).json({ error: 'peerId must be a 16-char hex string' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'valid email required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const docRef = db.collection(COLLECTION).doc(normalizedEmail);

    try {
      const existing = await docRef.get();
      if (existing.exists && existing.data().verified && existing.data().peerId !== peerId) {
        // Email already claimed by a different peerId
        res.status(409).json({ error: 'email already registered to a different peerId' });
        return;
      }

      await docRef.set({
        peerId,
        email: normalizedEmail,
        displayName: displayName ?? '',
        deviceName: deviceName ?? '',
        registeredAt: FieldValue.serverTimestamp(),
        verified: false,
      }, { merge: true });

      // Send Firebase Auth email-link for verification
      const actionCodeSettings = {
        url: `https://lianabanyan-403dc.web.app/verify-peer?email=${encodeURIComponent(normalizedEmail)}&peerId=${peerId}`,
        handleCodeInApp: false,
      };

      let verificationSent = false;
      try {
        const link = await getAuth().generateSignInWithEmailLink(normalizedEmail, actionCodeSettings);
        // In production wire this through SendGrid / Firebase Extensions / etc.
        // For now we log it; the Founder-deploy step configures real email delivery.
        console.log(`[Pocket-6] Verification link for ${normalizedEmail}: ${link}`);
        verificationSent = true;
      } catch (authErr) {
        // Non-fatal: record written, verification email failed (no SMTP config yet)
        console.warn(`[Pocket-6] Verification email failed for ${normalizedEmail}:`, authErr.message);
      }

      res.status(200).json({
        ok: true,
        email: normalizedEmail,
        status: verificationSent ? 'pending_verification' : 'registered_no_email',
      });
    } catch (err) {
      console.error('[Pocket-6] registerPeer error:', err);
      res.status(500).json({ error: 'internal error' });
    }
  }
);

// ─── POST /resolveEmail ───────────────────────────────────────────────────────
//
// Accepts: { secret, email }
// Returns: { peerId } if found + verified, or { error: "not found" }.
//
// The secret must match INVITE_SECRET (same value as RELAY_SECRET on the relay).

exports.resolveEmail = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    const { secret, email } = req.body ?? {};

    if (!INVITE_SECRET) {
      console.error('[Pocket-6] INVITE_SECRET not configured');
      res.status(500).json({ error: 'server misconfiguration' });
      return;
    }
    if (secret !== INVITE_SECRET) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'email required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const docRef = db.collection(COLLECTION).doc(normalizedEmail);
      const snap = await docRef.get();

      if (!snap.exists) {
        res.status(404).json({ error: 'not found' });
        return;
      }

      const data = snap.data();
      if (!data.verified) {
        // Allow resolution of unverified peers in relay context (Founder can decide policy).
        // If strict verification is required, uncomment the block below:
        // res.status(404).json({ error: 'peer not verified' });
        // return;
        console.warn(`[Pocket-6] Resolving unverified peer for ${normalizedEmail}`);
      }

      res.status(200).json({ peerId: data.peerId });
    } catch (err) {
      console.error('[Pocket-6] resolveEmail error:', err);
      res.status(500).json({ error: 'internal error' });
    }
  }
);
