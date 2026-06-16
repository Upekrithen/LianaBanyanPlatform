/**
 * comments.js — BP084 MnemosyneC Cooperative Comments Widget
 * Self-contained vanilla JS. No framework. No dependencies.
 * Mounts on any <div data-comments-thread="..."> element.
 *
 * Auth: reads member_token from localStorage (set by join flow / verify-mnemosynec-checkout).
 * API: Supabase edge functions at <supabase-url>/functions/v1/comments-*
 * Threads: gemma-main, how-it-works-gemma-section, substrate-main
 */

(function () {
  "use strict";

  /* ── Config ── */
  var SUPABASE_URL = "";
  var SUPABASE_ANON_KEY = "";
  var EDGE_BASE = "";
  var PAGE_SIZE = 20;

  /* Light markdown: paragraphs, **bold**, *italic*, `code`, [text](url) */
  function renderMarkdown(text) {
    if (!text) return "";
    var escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n+/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  }

  /* Relative time */
  function relTime(iso) {
    var d = new Date(iso);
    var now = Date.now();
    var diff = Math.floor((now - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 2592000) return Math.floor(diff / 86400) + "d ago";
    return d.toLocaleDateString();
  }

  /* Member token from localStorage */
  function getToken() {
    return localStorage.getItem("member_token") || null;
  }

  /* Auth header */
  function authHeader() {
    var token = getToken();
    if (token) return { "Authorization": "Bearer " + token };
    return {};
  }

  /* API call helper */
  function api(path, opts) {
    return fetch(EDGE_BASE + path, Object.assign({
      headers: Object.assign({
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
      }, authHeader()),
    }, opts));
  }

  /* HMAC-SHA256 using Web Crypto */
  async function hmacSign(memberId, threadSlug, createdAt, body) {
    var secret = SUPABASE_ANON_KEY; /* client-side sig uses anon key as shared secret */
    var enc = new TextEncoder();
    var key = await crypto.subtle.importKey(
      "raw", enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    var msg = enc.encode(memberId + threadSlug + createdAt + body);
    var sigBuf = await crypto.subtle.sign("HMAC", key, msg);
    return Array.from(new Uint8Array(sigBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /* ── Widget mount ── */
  function mountWidget(container) {
    var thread = container.dataset.commentsThread;
    if (!thread) return;

    /* Read config from data attrs or fall back to globals */
    var sbUrl = container.dataset.supabaseUrl || SUPABASE_URL;
    var sbKey = container.dataset.supabaseAnonKey || SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) return;

    SUPABASE_URL = sbUrl;
    SUPABASE_ANON_KEY = sbKey;
    EDGE_BASE = sbUrl + "/functions/v1";

    var state = {
      comments: [],
      loading: false,
      nextAfter: null,
      hasMore: true,
      replyTo: null,
      editingId: null,
      memberId: null,
    };

    /* Decode JWT minimally to get sub */
    function decodeMemberId(token) {
      try {
        var parts = token.split(".");
        var payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload.sub || null;
      } catch {
        return null;
      }
    }

    var token = getToken();
    if (token) state.memberId = decodeMemberId(token);

    /* ── HTML shell ── */
    container.innerHTML = [
      '<div class="mn-comments" id="mn-comments-' + thread + '">',
        '<h3 class="mn-comments__heading">Comments</h3>',
        '<div class="mn-comments__compose-area"></div>',
        '<div class="mn-comments__list" role="list" aria-live="polite" aria-label="Comments"></div>',
        '<div class="mn-comments__load-more-row"></div>',
      '</div>',
    ].join("");

    injectStyles();

    var root = container.querySelector(".mn-comments");
    var composeArea = root.querySelector(".mn-comments__compose-area");
    var list = root.querySelector(".mn-comments__list");
    var loadMoreRow = root.querySelector(".mn-comments__load-more-row");

    renderCompose();
    loadComments();

    /* ── Compose ── */
    function renderCompose(replyTo) {
      var isReply = !!replyTo;
      var label = isReply ? "Reply" : "Leave a comment";
      var placeholder = isReply ? "Write a reply… (markdown: **bold**, *italic*, `code`)" : "Write a comment… (markdown: **bold**, *italic*, `code`)";

      if (!state.memberId) {
        composeArea.innerHTML = [
          '<div class="mn-comments__auth-prompt">',
            '<p><a href="#join" class="mn-comments__join-btn" data-join-trigger="true">Join the Cooperative to comment</a></p>',
            '<p class="mn-comments__auth-note">$5/year &middot; one vote &middot; 83.3% back to members</p>',
          '</div>',
        ].join("");
        composeArea.querySelector("[data-join-trigger]").addEventListener("click", function (e) {
          e.preventDefault();
          /* Try to trigger the join modal the same way the existing join flow does */
          var joinBtn = document.querySelector("[data-mn-join]") || document.querySelector(".mn-join-btn") || document.querySelector("[data-action='join']");
          if (joinBtn) {
            joinBtn.click();
          } else {
            window.location.href = "/join/";
          }
        });
        return;
      }

      composeArea.innerHTML = [
        '<form class="mn-comments__form" data-form="compose">',
          isReply ? '<p class="mn-comments__reply-label">Replying to thread &#x21b3;</p>' : "",
          '<textarea class="mn-comments__textarea" placeholder="' + placeholder + '" maxlength="8000" rows="4" aria-label="' + label + '"></textarea>',
          '<div class="mn-comments__form-footer">',
            '<span class="mn-comments__char-counter">0 / 8000</span>',
            '<div class="mn-comments__form-btns">',
              isReply ? '<button type="button" class="mn-comments__btn mn-comments__btn--ghost" data-cancel-reply>Cancel</button>' : "",
              '<button type="submit" class="mn-comments__btn mn-comments__btn--primary">' + label + '</button>',
            '</div>',
          '</div>',
          '<div class="mn-comments__form-feedback" aria-live="polite"></div>',
        '</form>',
      ].join("");

      var form = composeArea.querySelector("form");
      var textarea = form.querySelector("textarea");
      var counter = form.querySelector(".mn-comments__char-counter");
      var feedback = form.querySelector(".mn-comments__form-feedback");

      textarea.addEventListener("input", function () {
        counter.textContent = textarea.value.length + " / 8000";
      });

      if (isReply) {
        form.querySelector("[data-cancel-reply]").addEventListener("click", function () {
          state.replyTo = null;
          renderCompose();
        });
      }

      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var body = textarea.value.trim();
        if (!body) return;
        var submitBtn = form.querySelector("[type=submit]");
        submitBtn.disabled = true;
        submitBtn.textContent = "Posting…";
        feedback.textContent = "";

        /* 200ms feedback guarantee */
        var feedbackTimer = setTimeout(function () {
          feedback.textContent = "Sending…";
        }, 150);

        try {
          var createdAt = new Date().toISOString();
          var sig = await hmacSign(state.memberId, thread, createdAt, body);
          var payload = { thread_slug: thread, body: body, heartbeat_sig: sig };
          if (replyTo) payload.parent_id = replyTo;

          var res = await api("/comments-post", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          clearTimeout(feedbackTimer);

          var data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to post");

          textarea.value = "";
          counter.textContent = "0 / 8000";
          feedback.textContent = "Posted!";
          state.replyTo = null;
          if (replyTo) renderCompose();

          /* Prepend new comment */
          if (data.comment) {
            state.comments.unshift(data.comment);
            renderList();
          } else {
            await reloadComments();
          }
        } catch (err) {
          clearTimeout(feedbackTimer);
          feedback.textContent = "Error: " + err.message;
          submitBtn.disabled = false;
          submitBtn.textContent = label;
        }
      });
    }

    /* ── Load ── */
    async function loadComments() {
      if (state.loading || !state.hasMore) return;
      state.loading = true;
      renderLoadMore("Loading…");

      try {
        var url = EDGE_BASE + "/comments-list?thread_slug=" + encodeURIComponent(thread) + "&limit=" + PAGE_SIZE;
        if (state.nextAfter) url += "&after=" + encodeURIComponent(state.nextAfter);
        var res = await fetch(url, {
          headers: { "apikey": SUPABASE_ANON_KEY },
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || "Load failed");

        state.comments = state.comments.concat(data.comments || []);
        state.hasMore = data.has_more || false;
        state.nextAfter = data.next_after || null;
        renderList();
      } catch (err) {
        renderLoadMore("Error loading comments: " + err.message);
      } finally {
        state.loading = false;
        if (state.hasMore) renderLoadMore("Load more");
        else renderLoadMore("");
      }
    }

    async function reloadComments() {
      state.comments = [];
      state.nextAfter = null;
      state.hasMore = true;
      await loadComments();
    }

    /* ── Render list ── */
    function renderList() {
      if (!state.comments.length) {
        list.innerHTML = '<p class="mn-comments__empty">No comments yet. Be the first.</p>';
        return;
      }

      /* Group top-level + replies */
      var topLevel = state.comments.filter(function (c) { return !c.parent_id; });
      var byParent = {};
      state.comments.forEach(function (c) {
        if (c.parent_id) {
          if (!byParent[c.parent_id]) byParent[c.parent_id] = [];
          byParent[c.parent_id].push(c);
        }
      });

      list.innerHTML = topLevel.map(function (c) {
        return renderComment(c, byParent[c.id] || []);
      }).join("");

      /* Bind actions */
      list.querySelectorAll("[data-reply]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.replyTo = btn.dataset.reply;
          renderCompose(state.replyTo);
          composeArea.querySelector("textarea") && composeArea.querySelector("textarea").focus();
        });
      });

      list.querySelectorAll("[data-upvote]").forEach(function (btn) {
        btn.addEventListener("click", function () { doVote(btn.dataset.upvote, 1, btn); });
      });
      list.querySelectorAll("[data-downvote]").forEach(function (btn) {
        btn.addEventListener("click", function () { doVote(btn.dataset.downvote, -1, btn); });
      });
      list.querySelectorAll("[data-flag]").forEach(function (btn) {
        btn.addEventListener("click", function () { doFlag(btn.dataset.flag); });
      });
      list.querySelectorAll("[data-delete]").forEach(function (btn) {
        btn.addEventListener("click", function () { doDelete(btn.dataset.delete, btn); });
      });
    }

    function renderComment(c, replies) {
      var isAuthor = state.memberId && c.member_id === state.memberId;
      var displayName = (c.members && c.members.display_name) ? c.members.display_name : "Member";
      var bodyHtml = renderMarkdown(c.body);

      return [
        '<div class="mn-comment" role="listitem" id="comment-' + c.id + '">',
          '<div class="mn-comment__meta">',
            '<span class="mn-comment__author">' + esc(displayName) + '</span>',
            '<span class="mn-comment__time" title="' + c.created_at + '">' + relTime(c.created_at) + '</span>',
            c.edited_at ? '<span class="mn-comment__edited">edited</span>' : "",
          '</div>',
          '<div class="mn-comment__body">' + bodyHtml + '</div>',
          '<div class="mn-comment__actions">',
            state.memberId ? '<button class="mn-comment__action" data-upvote="' + c.id + '" title="Upvote">&uarr; ' + (c.upvotes || 0) + '</button>' : '<span class="mn-comment__votes">&uarr; ' + (c.upvotes || 0) + '</span>',
            state.memberId ? '<button class="mn-comment__action" data-downvote="' + c.id + '" title="Downvote">&darr; ' + (c.downvotes || 0) + '</button>' : '<span class="mn-comment__votes">&darr; ' + (c.downvotes || 0) + '</span>',
            state.memberId ? '<button class="mn-comment__action" data-reply="' + c.id + '">Reply</button>' : "",
            state.memberId && !isAuthor ? '<button class="mn-comment__action mn-comment__action--flag" data-flag="' + c.id + '">Flag</button>' : "",
            isAuthor ? '<button class="mn-comment__action mn-comment__action--delete" data-delete="' + c.id + '">Delete</button>' : "",
          '</div>',
          replies.length ? '<div class="mn-comment__replies">' + replies.map(function (r) { return renderComment(r, []); }).join("") + '</div>' : "",
        '</div>',
      ].join("");
    }

    /* ── Actions ── */
    async function doVote(commentId, vote, btn) {
      if (!state.memberId) return;
      btn.disabled = true;
      setTimeout(function () { btn.disabled = false; }, 1500);
      try {
        var res = await api("/comments-vote", {
          method: "POST",
          body: JSON.stringify({ comment_id: commentId, vote: vote }),
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error);
        /* Update local state */
        var c = state.comments.find(function (x) { return x.id === commentId; });
        if (c) { c.upvotes = data.upvotes; c.downvotes = data.downvotes; }
        renderList();
      } catch (err) {
        console.warn("[comments] vote error:", err.message);
      }
    }

    async function doFlag(commentId) {
      if (!state.memberId) return;
      var reason = prompt("Reason for flagging this comment? (optional)") ?? "flagged";
      if (reason === null) return;
      try {
        var res = await api("/comments-flag", {
          method: "POST",
          body: JSON.stringify({ comment_id: commentId, reason: reason || "flagged" }),
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert("Flagged. Thank you.");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }

    async function doDelete(commentId, btn) {
      if (!state.memberId) return;
      if (!confirm("Delete this comment? This cannot be undone.")) return;
      btn.disabled = true;
      try {
        var res = await api("/comments-soft-delete", {
          method: "POST",
          body: JSON.stringify({ comment_id: commentId }),
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error);
        /* Remove from local state */
        state.comments = state.comments.filter(function (c) { return c.id !== commentId; });
        renderList();
      } catch (err) {
        alert("Error: " + err.message);
        btn.disabled = false;
      }
    }

    /* ── Load more ── */
    function renderLoadMore(text) {
      if (!text) { loadMoreRow.innerHTML = ""; return; }
      if (text === "Load more") {
        loadMoreRow.innerHTML = '<button class="mn-comments__load-more-btn">Load more</button>';
        loadMoreRow.querySelector("button").addEventListener("click", loadComments);
      } else {
        loadMoreRow.innerHTML = '<p class="mn-comments__load-status">' + esc(text) + '</p>';
      }
    }

    function esc(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  }

  /* ── Styles ── */
  function injectStyles() {
    if (document.getElementById("mn-comments-styles")) return;
    var style = document.createElement("style");
    style.id = "mn-comments-styles";
    style.textContent = [
      ".mn-comments { margin: 2rem 0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }",
      ".mn-comments__heading { font-size: 1.1rem; font-weight: 700; color: #d69e2e; margin: 0 0 1rem; }",
      ".mn-comments__auth-prompt { background: rgba(214,158,46,0.06); border: 1px solid rgba(214,158,46,0.2); border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1rem; }",
      ".mn-comments__auth-prompt p { margin: 0 0 0.4rem; color: rgba(250,245,235,0.82); font-size: 0.9rem; }",
      ".mn-comments__auth-prompt p:last-child { margin: 0; }",
      ".mn-comments__join-btn { color: #38a169 !important; font-weight: 700; text-decoration: underline; cursor: pointer; }",
      ".mn-comments__auth-note { color: rgba(250,245,235,0.45) !important; font-size: 0.8rem !important; }",
      ".mn-comments__form { margin-bottom: 1.5rem; }",
      ".mn-comments__reply-label { font-size: 0.82rem; color: #d69e2e; margin: 0 0 0.4rem; }",
      ".mn-comments__textarea { width: 100%; box-sizing: border-box; background: rgba(10,22,40,0.7); border: 1px solid rgba(214,158,46,0.25); border-radius: 8px; color: #faf5eb; padding: 0.75rem 1rem; font-size: 0.92rem; line-height: 1.65; resize: vertical; min-height: 80px; font-family: inherit; transition: border-color 0.15s; }",
      ".mn-comments__textarea:focus { outline: none; border-color: rgba(214,158,46,0.55); }",
      ".mn-comments__form-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }",
      ".mn-comments__char-counter { font-size: 0.75rem; color: rgba(250,245,235,0.35); }",
      ".mn-comments__form-btns { display: flex; gap: 0.5rem; }",
      ".mn-comments__form-feedback { font-size: 0.82rem; color: #38a169; min-height: 1.2em; margin-top: 0.3rem; }",
      ".mn-comments__btn { padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: background 0.15s, border-color 0.15s; font-family: inherit; }",
      ".mn-comments__btn--primary { background: #2d7d52; color: #fff; border-color: #2d7d52; }",
      ".mn-comments__btn--primary:hover { background: #38a169; border-color: #38a169; }",
      ".mn-comments__btn--primary:disabled { opacity: 0.55; cursor: not-allowed; }",
      ".mn-comments__btn--ghost { background: transparent; color: rgba(250,245,235,0.6); border-color: rgba(255,255,255,0.15); }",
      ".mn-comments__btn--ghost:hover { border-color: rgba(255,255,255,0.3); color: #faf5eb; }",
      ".mn-comment { border: 1px solid rgba(214,158,46,0.12); border-radius: 8px; padding: 0.9rem 1rem; margin-bottom: 0.75rem; background: rgba(10,22,40,0.4); }",
      ".mn-comment__replies { margin: 0.75rem 0 0 1.5rem; padding-left: 0.75rem; border-left: 2px solid rgba(214,158,46,0.18); }",
      ".mn-comment__meta { display: flex; align-items: baseline; gap: 0.6rem; margin-bottom: 0.5rem; flex-wrap: wrap; }",
      ".mn-comment__author { font-weight: 700; font-size: 0.88rem; color: #faf5eb; }",
      ".mn-comment__time { font-size: 0.75rem; color: rgba(250,245,235,0.4); }",
      ".mn-comment__edited { font-size: 0.72rem; color: rgba(214,158,46,0.5); font-style: italic; }",
      ".mn-comment__body { font-size: 0.9rem; color: rgba(250,245,235,0.82); line-height: 1.7; }",
      ".mn-comment__body p { margin: 0 0 0.5rem; }",
      ".mn-comment__body p:last-child { margin: 0; }",
      ".mn-comment__body code { background: rgba(255,255,255,0.07); border-radius: 3px; padding: 0.1em 0.3em; font-size: 0.85em; }",
      ".mn-comment__body a { color: #d69e2e; }",
      ".mn-comment__actions { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.6rem; flex-wrap: wrap; }",
      ".mn-comment__action { background: none; border: none; color: rgba(250,245,235,0.45); font-size: 0.78rem; cursor: pointer; padding: 0.15rem 0.3rem; border-radius: 4px; font-family: inherit; transition: color 0.15s, background 0.15s; }",
      ".mn-comment__action:hover { color: #faf5eb; background: rgba(255,255,255,0.06); }",
      ".mn-comment__action:disabled { opacity: 0.4; cursor: not-allowed; }",
      ".mn-comment__action--flag { color: rgba(214,158,46,0.4); }",
      ".mn-comment__action--delete { color: rgba(239,68,68,0.5); }",
      ".mn-comment__action--delete:hover { color: #ef4444; }",
      ".mn-comment__votes { font-size: 0.78rem; color: rgba(250,245,235,0.3); }",
      ".mn-comments__empty { color: rgba(250,245,235,0.35); font-size: 0.88rem; font-style: italic; }",
      ".mn-comments__load-more-btn { background: rgba(214,158,46,0.08); border: 1px solid rgba(214,158,46,0.2); color: #d69e2e; border-radius: 6px; padding: 0.5rem 1.2rem; cursor: pointer; font-size: 0.88rem; font-family: inherit; transition: background 0.15s; }",
      ".mn-comments__load-more-btn:hover { background: rgba(214,158,46,0.16); }",
      ".mn-comments__load-status { font-size: 0.82rem; color: rgba(250,245,235,0.35); }",
    ].join("\n");
    document.head.appendChild(style);
  }

  /* ── Boot: find all comment containers and mount ── */
  function boot() {
    var containers = document.querySelectorAll("[data-comments-thread]");
    containers.forEach(function (el) {
      try {
        mountWidget(el);
      } catch (err) {
        console.warn("[comments.js] mount error on thread=" + el.dataset.commentsThread + ":", err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
