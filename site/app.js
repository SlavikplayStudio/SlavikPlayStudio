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

  renderPrograms();
  renderNews();
  renderContacts();
})();
