(function () {
  "use strict";

  const CONTACT_TYPES = {
    phone: { label: "Phone", placeholder: "+38 (093) 10 10 306" },
    email: { label: "Email", placeholder: "hello@example.com" },
    website: { label: "Website", placeholder: "www.example.com" },
    text: { label: "Plain text", placeholder: "Department name" },
    custom: { label: "Custom link", placeholder: "Link text" },
  };

  let contacts = [
    { id: cryptoId(), type: "phone", value: "", url: "" },
  ];

  const DEFAULT_LOGO = {
    url: "https://cdn.prod.website-files.com/68421b7922dbd0dc94f14647/6a9088e279d2d80930ff6fe1_warmax_logo_dark.svg",
    link: "https://www.warmax.com.ua/",
    alt: "Warmax",
    width: 140,
  };

  const els = {
    fullName: document.getElementById("fullName"),
    jobTitle: document.getElementById("jobTitle"),
    contactsList: document.getElementById("contactsList"),
    addContact: document.getElementById("addContact"),
    showLogo: document.getElementById("showLogo"),
    logoUrl: document.getElementById("logoUrl"),
    logoLink: document.getElementById("logoLink"),
    logoAlt: document.getElementById("logoAlt"),
    logoWidth: document.getElementById("logoWidth"),
    previewFrame: document.getElementById("previewFrame"),
    previewEmpty: document.getElementById("previewEmpty"),
    codeOutput: document.getElementById("codeOutput"),
    copyBtn: document.getElementById("copyBtn"),
  };

  function cryptoId() {
    return "c" + Math.random().toString(36).slice(2, 10);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderContactRows() {
    els.contactsList.innerHTML = "";

    contacts.forEach((contact) => {
      const row = document.createElement("div");
      row.className = "contact-row" + (contact.type === "custom" ? " has-url" : "");
      row.dataset.id = contact.id;

      const typeSelect = document.createElement("select");
      typeSelect.className = "contact-type";
      Object.entries(CONTACT_TYPES).forEach(([key, meta]) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = meta.label;
        if (key === contact.type) opt.selected = true;
        typeSelect.appendChild(opt);
      });
      typeSelect.addEventListener("change", (e) => {
        contact.type = e.target.value;
        renderContactRows();
        updateOutput();
      });

      const valueInput = document.createElement("input");
      valueInput.type = "text";
      valueInput.className = "contact-value";
      valueInput.placeholder = CONTACT_TYPES[contact.type].placeholder;
      valueInput.value = contact.value;
      valueInput.addEventListener("input", (e) => {
        contact.value = e.target.value;
        updateOutput();
      });

      row.appendChild(typeSelect);
      row.appendChild(valueInput);

      if (contact.type === "custom") {
        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.className = "contact-url";
        urlInput.placeholder = "https://example.com";
        urlInput.value = contact.url;
        urlInput.addEventListener("input", (e) => {
          contact.url = e.target.value;
          updateOutput();
        });
        row.appendChild(urlInput);
      }

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-contact";
      removeBtn.innerHTML = "&times;";
      removeBtn.title = "Remove contact";
      removeBtn.addEventListener("click", () => {
        contacts = contacts.filter((c) => c.id !== contact.id);
        renderContactRows();
        updateOutput();
      });

      row.appendChild(removeBtn);
      els.contactsList.appendChild(row);
    });
  }

  function contactHref(contact) {
    const value = contact.value.trim();
    if (!value) return null;

    switch (contact.type) {
      case "phone": {
        const digits = value.replace(/[^\d+]/g, "");
        return digits ? `tel:${digits}` : null;
      }
      case "email":
        return `mailto:${value}`;
      case "website":
        return /^https?:\/\//i.test(value) ? value : `https://${value}`;
      case "custom": {
        const url = contact.url.trim();
        return url || null;
      }
      case "text":
      default:
        return null;
    }
  }

  function buildSignatureHtml() {
    const name = els.fullName.value.trim();
    const title = els.jobTitle.value.trim();
    const showLogo = els.showLogo.checked;
    const customLogoUrl = els.logoUrl.value.trim();
    const logoUrl = showLogo ? customLogoUrl || DEFAULT_LOGO.url : "";
    const logoLink = showLogo
      ? els.logoLink.value.trim() || (customLogoUrl ? "" : DEFAULT_LOGO.link)
      : "";
    const logoAlt = showLogo
      ? els.logoAlt.value.trim() || (customLogoUrl ? "Logo" : DEFAULT_LOGO.alt)
      : "";
    const logoWidth = parseInt(els.logoWidth.value, 10) || DEFAULT_LOGO.width;

    const validContacts = contacts.filter((c) => c.value.trim());

    if (!name && !title && validContacts.length === 0 && !logoUrl) {
      return "";
    }

    let rows = "";

    if (name) {
      rows += `        <div style="font-size: 16px; line-height: 20px; font-weight: 700;">
          ${escapeHtml(name)}
        </div>\n\n`;
    }

    if (title) {
      rows += `        <div style="font-size: 14px; line-height: 20px; color: #949494;">
          ${escapeHtml(title)}
        </div>\n\n`;
    }

    validContacts.forEach((contact, index) => {
      const paddingTop = index === 0 ? "10px" : "4px";
      const href = contactHref(contact);
      const displayText =
        contact.type === "custom" ? contact.value.trim() : contact.value.trim();

      if (href) {
        rows += `        <div style="padding-top: ${paddingTop};">
          <a
            href="${escapeHtml(href)}"
            style="font-size: 14px; line-height: 20px; color: #000000; text-decoration: none;"
          >
            ${escapeHtml(displayText)}
          </a>
        </div>\n\n`;
      } else {
        rows += `        <div style="padding-top: ${paddingTop}; font-size: 14px; line-height: 20px; color: #000000;">
          ${escapeHtml(displayText)}
        </div>\n\n`;
      }
    });

    if (logoUrl) {
      const imgTag = `<img
              width="${logoWidth}"
              alt="${escapeHtml(logoAlt)}"
              src="${escapeHtml(logoUrl)}"
              style="display: block; width: ${logoWidth}px; height: auto; border: 0;"
            >`;

      rows += `        <div style="padding-top: 18px;">\n`;
      if (logoLink) {
        rows += `          <a
            href="${escapeHtml(logoLink)}"
            target="_blank"
            style="display: inline-block; text-decoration: none;"
          >
            ${imgTag}
          </a>\n`;
      } else {
        rows += `          ${imgTag}\n`;
      }
      rows += `        </div>\n\n`;
    }

    rows = rows.replace(/\n\n$/, "\n");

    return `<table
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="font-family: Arial, sans-serif; border: 0; border-collapse: collapse;"
>
  <tbody>
    <tr>
      <td style="padding: 0; border: 0;">
${rows}      </td>
    </tr>
  </tbody>
</table>`;
  }

  function updateOutput() {
    const html = buildSignatureHtml();

    if (!html) {
      els.codeOutput.value = "";
      els.previewFrame.srcdoc = "";
      els.previewEmpty.style.display = "flex";
      els.copyBtn.disabled = true;
      return;
    }

    els.previewEmpty.style.display = "none";
    els.codeOutput.value = html;
    els.previewFrame.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:16px;font-family:Arial,sans-serif;}</style></head><body>${html}</body></html>`;
    els.copyBtn.disabled = false;
  }

  els.addContact.addEventListener("click", () => {
    contacts.push({ id: cryptoId(), type: "phone", value: "", url: "" });
    renderContactRows();
    updateOutput();
  });

  els.copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(els.codeOutput.value);
      const original = els.copyBtn.textContent;
      els.copyBtn.textContent = "Copied!";
      setTimeout(() => {
        els.copyBtn.textContent = original;
      }, 1500);
    } catch (err) {
      els.codeOutput.select();
      document.execCommand("copy");
    }
  });

  [
    els.fullName,
    els.jobTitle,
    els.logoUrl,
    els.logoLink,
    els.logoAlt,
    els.logoWidth,
  ].forEach((el) => el.addEventListener("input", updateOutput));

  function toggleLogoFields() {
    els.showLogo.closest(".field-group").classList.toggle("is-disabled", !els.showLogo.checked);
  }

  els.showLogo.addEventListener("change", () => {
    toggleLogoFields();
    updateOutput();
  });

  toggleLogoFields();
  renderContactRows();
  updateOutput();

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
})();
