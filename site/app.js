(function () {
  const data = window.SPS_CONTENT || { programs: [], news: [], contacts: {} };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Supports **bold** and #tags in descriptions.
  function formatRichText(value) {
    const escaped = escapeHtml(value);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return withBold.replace(/(^|\s)#([A-Za-z0-9_\u0400-\u04FF-]+)/g, '$1<span class="tag">#$2</span>');
  }

  function normalizeUserTag(value) {
    const v = String(value || "").trim();
    if (!v) return "";
    return v.startsWith("#") ? v : "#" + v;
  }

  function normalizeRole(value) {
    return String(value || "").trim();
  }

  function groupPrograms(list) {
    const map = new Map();
    list.forEach((p) => {
      if (!map.has(p.section)) map.set(p.section, []);
      map.get(p.section).push(p);
    });
    return map;
  }

  function renderPrograms() {
    const host = document.getElementById("program-sections");
    host.innerHTML = "";
    const groups = groupPrograms(data.programs || []);

    groups.forEach((items, sectionName) => {
      const section = document.createElement("section");
      section.className = "section";

      const title = document.createElement("h2");
      title.textContent = sectionName;
      section.appendChild(title);

      const byTitle = new Map();
      items.forEach((x) => {
        if (!byTitle.has(x.title)) byTitle.set(x.title, []);
        byTitle.get(x.title).push(x);
      });

      const grid = document.createElement("div");
      grid.className = "grid";

      byTitle.forEach((versions, appTitle) => {
        const card = document.createElement("article");
        card.className = "card";

        const h3 = document.createElement("h3");
        h3.textContent = appTitle;
        card.appendChild(h3);

        const p = document.createElement("p");
        p.className = "rich-text";
        p.innerHTML = formatRichText(versions[0].description || "");
        card.appendChild(p);

        if (versions[0].idea || versions[0].userTag || versions[0].userRole) {
          const meta = document.createElement("div");
          meta.className = "idea-meta";

          if (versions[0].idea) {
            const idea = document.createElement("span");
            idea.className = "idea-text";
            idea.innerHTML = "<strong>User idea:</strong> " + formatRichText(versions[0].idea);
            meta.appendChild(idea);
          }

          if (versions[0].userTag) {
            const user = document.createElement("span");
            user.className = "user-tag";
            user.textContent = normalizeUserTag(versions[0].userTag);
            meta.appendChild(user);
          }

          if (versions[0].userRole) {
            const role = document.createElement("span");
            role.className = "user-role";
            role.textContent = normalizeRole(versions[0].userRole);
            meta.appendChild(role);
          }

          card.appendChild(meta);
        }

        const vbox = document.createElement("div");
        vbox.className = "versions";
        versions.forEach((v) => {
          const a = document.createElement("a");
          a.className = "version";
          a.href = v.link;
          a.textContent = v.versionLabel;
          vbox.appendChild(a);
        });
        card.appendChild(vbox);
        grid.appendChild(card);
      });

      section.appendChild(grid);
      host.appendChild(section);
    });
  }

  function renderNews() {
    const host = document.getElementById("news-list");
    host.innerHTML = "";
    (data.news || []).forEach((n) => {
      const item = document.createElement("article");
      item.className = "news__item";

      const time = document.createElement("time");
      time.dateTime = n.date;
      time.textContent = n.date;
      item.appendChild(time);

      const h3 = document.createElement("h3");
      h3.textContent = n.title;
      item.appendChild(h3);

      const p = document.createElement("p");
      p.textContent = n.text;
      item.appendChild(p);

      host.appendChild(item);
    });
  }

  function renderContacts() {
    document.getElementById("contact-telegram").href = data.contacts?.telegram || "#";
    document.getElementById("contact-discord").href = data.contacts?.discord || "#";
    document.getElementById("contact-github").href = data.contacts?.github || "#";
  }

  function setupIdeaPopup() {
    const fab = document.getElementById("idea-fab");
    const popup = document.getElementById("idea-popup");
    const closeBtn = document.getElementById("idea-close");
    const form = document.getElementById("idea-form");
    if (!fab || !popup || !closeBtn || !form) return;

    const openPopup = () => {
      popup.classList.add("open");
      popup.setAttribute("aria-hidden", "false");
    };
    const closePopup = () => {
      popup.classList.remove("open");
      popup.setAttribute("aria-hidden", "true");
    };

    fab.addEventListener("click", () => {
      if (popup.classList.contains("open")) closePopup();
      else openPopup();
    });
    closeBtn.addEventListener("click", closePopup);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = document.getElementById("idea-type").value.trim();
      const program = document.getElementById("idea-program").value.trim();
      const help = document.getElementById("idea-help").value.trim();
      const user = document.getElementById("idea-user").value.trim();
      const message = document.getElementById("idea-message").value.trim();
      if (!type || !program || !help || !user || !message) return;

      const tag = user.startsWith("#") ? user : `#${user}`;
      const title = `[Idea] ${program} - ${type}`;
      const body = [
        "## Idea / Help Request",
        `- Type: ${type}`,
        `- Program: ${program}`,
        `- Role: ${help}`,
        `- User: ${tag}`,
        "",
        "### Message",
        message,
        "",
        "_Created from SlavikPlayStudio website_"
      ].join("\n");

      const labels = "idea-request,community";
      const url = `https://github.com/SlavikplayStudio/SlavikPlayStudio/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      closePopup();
      form.reset();
    });
  }

  renderPrograms();
  renderNews();
  renderContacts();
  setupIdeaPopup();
})();
