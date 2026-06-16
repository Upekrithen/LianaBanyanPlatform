---
title: "Substrate Awakens · Register"
date: 2026-06-20
description: "Register for the first live cooperative mesh benchmark. Get your heartbeat token."
mimic-trunk-eligible: true
---

# Register for Substrate Awakens

Reserve your slot. Receive your one-time heartbeat token by email.

<div id="register-wrap" style="max-width:520px;margin:2rem 0;">
<form id="register-form" style="display:flex;flex-direction:column;gap:1.1rem;">
  <label style="display:flex;flex-direction:column;gap:.35rem;font-size:.92rem;color:rgba(250,245,235,.82);">
    Email
    <input type="email" name="email" required
      style="background:#0d1a2e;border:1px solid rgba(99,179,237,.35);border-radius:6px;padding:.55rem .85rem;color:#faf5eb;font-size:.95rem;outline:none;" />
  </label>
  <label style="display:flex;flex-direction:column;gap:.35rem;font-size:.92rem;color:rgba(250,245,235,.82);">
    Display name <span style="color:rgba(250,245,235,.4);font-size:.8rem;">(optional — defaults to email prefix)</span>
    <input type="text" name="display_name" placeholder="e.g. replicator_7"
      style="background:#0d1a2e;border:1px solid rgba(99,179,237,.35);border-radius:6px;padding:.55rem .85rem;color:#faf5eb;font-size:.95rem;outline:none;" />
  </label>
  <label style="display:flex;flex-direction:column;gap:.35rem;font-size:.92rem;color:rgba(250,245,235,.82);">
    RAM tier
    <select name="ram_tier"
      style="background:#0d1a2e;border:1px solid rgba(99,179,237,.35);border-radius:6px;padding:.55rem .85rem;color:#faf5eb;font-size:.95rem;outline:none;">
      <option value="unknown">I don't know</option>
      <option value="lightweight">&lt;12 GB (lightweight — gemma2:2b)</option>
      <option value="standard">12–20 GB (standard)</option>
      <option value="premium">20–48 GB (premium — gemma4:12b)</option>
      <option value="heavy">&gt;48 GB (heavy)</option>
    </select>
  </label>
  <label style="display:flex;gap:.6rem;align-items:flex-start;font-size:.88rem;color:rgba(250,245,235,.78);cursor:pointer;">
    <input type="checkbox" name="truth_always" required style="margin-top:.2rem;accent-color:#63b3ed;" />
    <span>I'll honor Andon-Cord quarantines and not game the mesh. Truth-Always is the substrate's only rule.</span>
  </label>
  <button type="submit"
    style="background:#1a4a8a;color:#7fd1ff;border:2px solid #5a9ae0;border-radius:8px;padding:.7rem 1.6rem;font-size:1rem;font-weight:700;cursor:pointer;transition:background .15s;align-self:flex-start;">
    Register → Get my token
  </button>
  <p id="register-status" style="font-size:.9rem;color:#63b3ed;min-height:1.4rem;"></p>
</form>
</div>

<script>
(function () {
  var EDGE_BASE = "https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1";
  var form = document.getElementById("register-form");
  var status = document.getElementById("register-status");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Sending…";
    status.textContent = "";

    var data = {
      email: form.email.value.trim(),
      display_name: form.display_name.value.trim() || null,
      ram_tier: form.ram_tier.value
    };

    try {
      var resp = await fetch(EDGE_BASE + "/register-SubstrateAwakens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      var json = await resp.json();
      if (resp.ok && json.success) {
        status.style.color = "#68d391";
        status.textContent = json.message || "Check your email for your token.";
        form.reset();
      } else {
        status.style.color = "#f56565";
        status.textContent = json.error || "Registration failed. Try again.";
        btn.disabled = false;
        btn.textContent = "Register → Get my token";
      }
    } catch (err) {
      status.style.color = "#f56565";
      status.textContent = "Network error. Try again.";
      btn.disabled = false;
      btn.textContent = "Register → Get my token";
    }
  });
})();
</script>

---

Already registered? → [Watch the live dashboard](/live/SubstrateAwakens/)

Questions? → [See the kit page](/live/SubstrateAwakens/kit/)
