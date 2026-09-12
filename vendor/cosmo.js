(function (global) {
  "use strict";

  const VERSION = "0.1.0";
  const safe = value => String(value == null ? "" : value);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
  const words = text => safe(text).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];

  function memoryKey(userId, programId) {
    return "infinity.cosmo.v1:" + encodeURIComponent(userId || "guest") + ":" + encodeURIComponent(programId || "unknown");
  }

  function localMemory(userId, programId) {
    const key = memoryKey(userId, programId);
    return {
      async load() {
        try { return JSON.parse(localStorage.getItem(key)) || { messages: [], seenMoments: [], cards: [] }; }
        catch (_) { return { messages: [], seenMoments: [], cards: [] }; }
      },
      async save(value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
      }
    };
  }

  function normalizeIndex(data) {
    const moments = Array.isArray(data) ? data : Array.isArray(data && data.moments) ? data.moments : [];
    return moments.map((m, i) => ({
      id: safe(m.id || "moment-" + i),
      start: Math.max(0, Number(m.start) || 0),
      end: Math.max(Number(m.start) || 0, Number(m.end) || Number(m.start) + 20),
      transcript: safe(m.transcript),
      setting: safe(m.setting),
      actions: Array.isArray(m.actions) ? m.actions.map(safe) : [],
      themes: Array.isArray(m.themes) ? m.themes.map(safe) : [],
      entities: Array.isArray(m.entities) ? m.entities : [],
      objects: Array.isArray(m.objects) ? m.objects : [],
      connections: Array.isArray(m.connections) ? m.connections : [],
      source: m.source || null
    })).sort((a, b) => a.start - b.start);
  }

  function retrieve(index, seconds, radius) {
    const near = index.filter(m => m.end >= seconds - radius && m.start <= seconds + radius);
    if (near.length) return near.slice(0, 8);
    return index.slice().sort((a, b) => Math.abs(a.start - seconds) - Math.abs(b.start - seconds)).slice(0, 3);
  }

  function concepts(moments) {
    const map = new Map();
    const add = (label, type, detail) => {
      label = safe(label).trim();
      if (!label) return;
      const key = type + ":" + label.toLowerCase();
      if (!map.has(key)) map.set(key, { label, type, detail: safe(detail), weight: 0 });
      map.get(key).weight += 1;
    };
    moments.forEach(m => {
      m.entities.forEach(e => add(e.name || e.label, e.type || "entity", e.description));
      m.objects.forEach(o => add(o.name || o.label || o, "object", o.description));
      m.themes.forEach(t => add(t, "theme", ""));
      m.connections.forEach(c => {
        add(c.from, c.fromType || "concept", c.relationship);
        add(c.to, c.toType || "related", c.relationship);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.weight - a.weight).slice(0, 20);
  }

  function groundedFallback(payload) {
    const moment = payload.moments[0];
    if (!moment) return { text: "I’m ready, but this program has not supplied a scene index yet.", prompts: [] };
    const names = payload.concepts.slice(0, 3).map(c => c.label);
    const anchor = names.length ? names.join(", ") : moment.setting || "this scene";
    return {
      text: "I noticed " + anchor + " around " + formatTime(payload.playback.seconds) + ". What part would you like me to open up—the story, the people, an object on screen, or how this moment connects to something else?",
      prompts: ["Explain this moment", "What did you notice?", "Connect the ideas"]
    };
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }

  class CosmoSession {
    constructor(options) {
      this.options = options || {};
      this.root = this.options.root;
      if (!this.root) throw new Error("Cosmo.mount requires a root element");
      this.index = [];
      this.state = { messages: [], seenMoments: [], cards: [] };
      this.lastProgramId = "";
      this.lastPromptAt = 0;
      this.timer = 0;
      this.render();
      this.bind();
      this.refresh(true);
      this.timer = setInterval(() => this.refresh(false), clamp(this.options.pollMs || 3000, 1000, 30000));
    }

    value(name, fallback) {
      const candidate = this.options[name];
      try { return typeof candidate === "function" ? candidate() : candidate || fallback; }
      catch (_) { return fallback; }
    }

    async refresh(force) {
      const program = await Promise.resolve(this.value("program", {}));
      const playback = await Promise.resolve(this.value("playback", { seconds: 0, playing: false }));
      if (!program || !program.id) return;
      if (force || program.id !== this.lastProgramId) {
        this.lastProgramId = program.id;
        const user = this.value("user", { id: "guest" });
        this.store = this.options.memory || localMemory(user && user.id, program.id);
        this.state = await this.store.load();
        const raw = await Promise.resolve(this.value("index", []));
        this.index = normalizeIndex(raw);
        this.title.textContent = "Cosmo · " + safe(program.title || "Now watching");
        this.drawMessages();
      }
      this.playback = { seconds: Math.max(0, Number(playback.seconds) || 0), playing: !!playback.playing };
      this.program = program;
      this.moment.textContent = "Scene context · " + formatTime(this.playback.seconds);
      if (!force) this.maybePrompt();
    }

    currentPayload(message) {
      const moments = retrieve(this.index, this.playback.seconds, 45);
      return {
        version: VERSION,
        message: safe(message),
        program: this.program,
        playback: this.playback,
        moments,
        concepts: concepts(moments),
        history: this.state.messages.slice(-12)
      };
    }

    async ask(message, proactive) {
      message = safe(message).trim();
      if (!message && !proactive) return;
      if (message) this.add("user", message);
      const payload = this.currentPayload(message || "Offer one concise, useful observation or question about the current scene.");
      this.setBusy(true);
      try {
        const response = this.options.respond ? await this.options.respond(payload) : groundedFallback(payload);
        this.add("cosmo", safe(response && (response.text || response.message) || "I could not form a grounded response from this scene."));
        this.drawPrompts(response && response.prompts);
      } catch (_) {
        this.add("cosmo", "I couldn’t reach the response service. The scene index is still available, so you can try again without losing your place.");
      } finally {
        this.setBusy(false);
      }
    }

    maybePrompt() {
      if (!this.playback.playing || Date.now() - this.lastPromptAt < (this.options.proactiveEveryMs || 180000)) return;
      const near = retrieve(this.index, this.playback.seconds, 8)[0];
      if (!near || this.state.seenMoments.includes(near.id)) return;
      this.state.seenMoments = this.state.seenMoments.concat(near.id).slice(-200);
      this.lastPromptAt = Date.now();
      this.persist();
      this.ask("", true);
    }

    async discover() {
      if (!this.options.discover) return this.add("cosmo", "Product discovery is not connected for this channel yet.");
      const payload = this.currentPayload("Find an optional, scene-relevant item.");
      this.setBusy(true);
      try {
        const result = await this.options.discover(payload);
        if (!result || result.approved === false) return this.add("cosmo", "I didn’t find a product suggestion that passed the channel’s relevance and governance checks.");
        const when = result.retrievedAt ? " · checked " + new Date(result.retrievedAt).toLocaleString() : "";
        this.add("cosmo", "Optional find: " + safe(result.title) + (result.price ? " · " + safe(result.price) : "") + when, result.url);
      } catch (_) { this.add("cosmo", "Product discovery is temporarily unavailable."); }
      finally { this.setBusy(false); }
    }

    async createCard() {
      if (!this.options.frame) return this.add("cosmo", "This player has not supplied an authorized frame or still provider, so I won’t pretend I captured one.");
      this.setBusy(true);
      try {
        const frame = await this.options.frame({ program: this.program, playback: this.playback });
        if (!frame || !frame.url) throw new Error("blocked");
        const payload = this.currentPayload("Write a concise collectible-card title and back story grounded in this exact moment.");
        const story = this.options.respond ? await this.options.respond(payload) : groundedFallback(payload);
        const card = { id: crypto.randomUUID ? crypto.randomUUID() : "card-" + Date.now(), image: frame.url, title: safe(story.title || this.program.title), story: safe(story.back || story.text), program: this.program, seconds: this.playback.seconds, source: frame.source || null, createdAt: Date.now() };
        this.state.cards = this.state.cards.concat(card).slice(-100);
        await this.persist();
        if (typeof this.options.onCard === "function") this.options.onCard(card);
        this.add("cosmo", "Your unique card preview is ready. It records this program and moment before anything is saved or minted.");
      } catch (_) { this.add("cosmo", "The video host blocked direct frame capture. Use an authorized still or approve a device screenshot, and I can build the card honestly."); }
      finally { this.setBusy(false); }
    }

    add(role, text, url) {
      this.state.messages.push({ role, text, url: url || "", at: Date.now(), seconds: this.playback ? this.playback.seconds : 0 });
      this.state.messages = this.state.messages.slice(-100);
      this.persist();
      this.drawMessages();
    }

    persist() { return this.store && this.store.save(this.state); }
    setBusy(value) { this.send.disabled = value; this.input.disabled = value; this.root.dataset.busy = value ? "true" : "false"; }

    drawMessages() {
      this.log.replaceChildren();
      this.state.messages.slice(-30).forEach(item => {
        const article = document.createElement("article");
        article.className = "cosmo-message " + (item.role === "user" ? "is-user" : "is-cosmo");
        const p = document.createElement("p"); p.textContent = item.text; article.appendChild(p);
        if (item.url) { const a = document.createElement("a"); a.href = item.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open sourced result ↗"; article.appendChild(a); }
        this.log.appendChild(article);
      });
      this.log.scrollTop = this.log.scrollHeight;
    }

    drawPrompts(prompts) {
      this.prompts.replaceChildren();
      (Array.isArray(prompts) ? prompts : []).slice(0, 3).forEach(label => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = safe(label); b.addEventListener("click", () => this.ask(label)); this.prompts.appendChild(b);
      });
    }

    render() {
      this.root.classList.add("cosmo");
      this.root.innerHTML = '<header><div><small id="cosmoMoment">WATCH COMPANION</small><strong id="cosmoTitle">Cosmo</strong></div><button class="cosmo-close" type="button" aria-label="Close Cosmo">×</button></header><div class="cosmo-log" aria-live="polite"></div><div class="cosmo-prompts"></div><div class="cosmo-actions"><button type="button" data-action="discover">Find something from this scene</button><button type="button" data-action="card">Make my moment card</button></div><form><textarea rows="2" placeholder="Ask Cosmo about what you’re watching" aria-label="Ask Cosmo"></textarea><button type="submit">Ask</button></form>';
      this.title = this.root.querySelector("#cosmoTitle"); this.moment = this.root.querySelector("#cosmoMoment"); this.log = this.root.querySelector(".cosmo-log"); this.prompts = this.root.querySelector(".cosmo-prompts"); this.input = this.root.querySelector("textarea"); this.send = this.root.querySelector('form button[type="submit"]');
    }

    bind() {
      this.root.querySelector("form").addEventListener("submit", e => { e.preventDefault(); const value = this.input.value; this.input.value = ""; this.ask(value); });
      this.root.querySelector('[data-action="discover"]').addEventListener("click", () => this.discover());
      this.root.querySelector('[data-action="card"]').addEventListener("click", () => this.createCard());
      this.root.querySelector(".cosmo-close").addEventListener("click", () => this.root.toggleAttribute("hidden"));
    }

    destroy() { clearInterval(this.timer); }
  }

  global.Cosmo = { version: VERSION, mount: options => new CosmoSession(options), normalizeIndex, retrieve, concepts };
})(window);
