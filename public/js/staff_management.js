(function () {
  var cfg = window.STAFF_PAGE || {};
  var accounts = cfg.accounts || [];
  var modal = document.getElementById("staff-modal");
  var modalCard = document.getElementById("staff-modal-card");
  var form = document.getElementById("staff-form");
  var flash = document.getElementById("staff-flash");
  var roleSelect = document.getElementById("staff-role");
  var osdWrap = document.getElementById("staff-osd-category-wrap");
  var whatsappWrap = document.getElementById("staff-whatsapp-wrap");
  var modalSubtitle = document.getElementById("staff-modal-subtitle");
  var modalIcon = document.getElementById("staff-modal-icon");
  var passwordLabelText = document.getElementById("staff-password-label-text");
  var passwordReq = document.getElementById("staff-password-req");
  var passwordHint = document.getElementById("staff-password-hint");
  var saveBtn = document.getElementById("staff-save-btn");
  var usernameBadge = document.getElementById("staff-username-badge");
  var editPreview = document.getElementById("staff-edit-preview");
  var searchInput = document.getElementById("staff-search");
  var statusFilter = document.getElementById("staff-status-filter");
  var noResults = document.getElementById("staff-no-results");
  var pwToggle = document.getElementById("staff-toggle-password");
  var pwdInput = document.getElementById("staff-password");
  var confirmDialog = document.getElementById("staff-confirm");
  var confirmResolve = null;

  function isOriya() {
    return document.body.classList.contains("ui-lang-or");
  }

  function t(en, or) {
    return isOriya() ? or : en;
  }

  function accountById(id) {
    return accounts.find(function (a) { return String(a.id) === String(id); });
  }

  function isOsdRole(role) {
    return role && role.indexOf("osd_") === 0;
  }

  function initialsFromName(name) {
    var parts = (name || "").trim().split(/\s+/);
    if (!parts.length || !parts[0]) return "??";
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  function roleLabel(role) {
    if (!role) return "";
    return role.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function toggleRoleFields() {
    var role = roleSelect ? roleSelect.value : "";
    var osd = isOsdRole(role);
    if (osdWrap) osdWrap.classList.toggle("hidden", !osd);
    if (whatsappWrap) whatsappWrap.classList.toggle("hidden", !osd);
  }

  function showFlash(message, isError) {
    if (!flash) return;
    flash.textContent = message;
    flash.classList.remove("hidden", "success", "error");
    flash.classList.add(isError ? "error" : "success");
  }

  function closeConfirm(result) {
    if (!confirmDialog) return;
    confirmDialog.classList.remove("is-open");
    confirmDialog.setAttribute("aria-hidden", "true");
    if (confirmResolve) {
      var resolve = confirmResolve;
      confirmResolve = null;
      resolve(!!result);
    }
  }

  function showStaffConfirm(mode, account) {
    return new Promise(function (resolve) {
      if (!confirmDialog) {
        resolve(false);
        return;
      }
      confirmResolve = resolve;
      var isActivate = mode === "activate";
      var confirmCard = document.getElementById("staff-confirm-card");
      var iconEl = document.getElementById("staff-confirm-icon");
      var titleEl = document.getElementById("staff-confirm-title");
      var msgEl = document.getElementById("staff-confirm-message");
      var accountEl = document.getElementById("staff-confirm-account");
      var okBtn = document.getElementById("staff-confirm-ok");
      var cancelBtn = document.getElementById("staff-confirm-cancel");

      if (confirmCard) {
        confirmCard.classList.toggle("staff-confirm-card--activate", isActivate);
        confirmCard.classList.toggle("staff-confirm-card--deactivate", !isActivate);
      }
      if (iconEl) iconEl.textContent = isActivate ? "✓" : "⚠";
      if (titleEl) {
        titleEl.textContent = isActivate
          ? t("Reactivate account?", "ଖାତା ପୁନର୍ବାର ସକ୍ରିୟ କରିବେ?")
          : t("Deactivate account?", "ଖାତା ନିଷ୍କ୍ରିୟ କରିବେ?");
      }
      if (msgEl) {
        msgEl.textContent = isActivate
          ? t(
              "This officer will be able to sign in again with their existing username and password.",
              "ଏହି ଅଧିକାରୀ ପୁନର୍ବାର ନିଜ ଟିମେଲ ଓ ପାସୱାର୍ଡ ସହ ସାଇନ ଇନ କରିପାରିବେ।"
            )
          : t(
              "This officer will no longer be able to sign in until the account is reactivated.",
              "ଖାତା ପୁନର୍ବାର ସକ୍ରିୟ ନ ହେବା ପର୍ଯ୍ୟନ୍ତ ଏହି ଅଧିକାରୀ ସାଇନ ଇନ କରିପାରିବେ ନାହିଁ।"
            );
      }
      if (okBtn) {
        okBtn.textContent = isActivate ? t("Activate", "ସକ୍ରିୟ") : t("Deactivate", "ନିଷ୍କ୍ରିୟ");
        okBtn.classList.toggle("success", isActivate);
        okBtn.classList.toggle("danger", !isActivate);
      }
      if (cancelBtn) cancelBtn.textContent = t("Cancel", "ବାତିଲ");

      if (accountEl && account) {
        accountEl.classList.remove("hidden");
        accountEl.innerHTML =
          '<div class="staff-confirm-account-name"></div>' +
          '<div class="staff-confirm-account-meta"></div>';
        accountEl.querySelector(".staff-confirm-account-name").textContent = account.name || account.username;
        accountEl.querySelector(".staff-confirm-account-meta").textContent =
          (account.email || "") + (account.username ? " · @" + account.username : "");
      } else if (accountEl) {
        accountEl.classList.add("hidden");
        accountEl.textContent = "";
      }

      confirmDialog.classList.add("is-open");
      confirmDialog.setAttribute("aria-hidden", "false");
      if (okBtn) okBtn.focus();
    });
  }

  function showDeactivateConfirm(account) {
    return showStaffConfirm("deactivate", account);
  }

  function showActivateConfirm(account) {
    return showStaffConfirm("activate", account);
  }

  function updateEditPreview(account) {
    if (!editPreview || !account) return;
    var avatar = document.getElementById("staff-edit-avatar");
    var nameEl = document.getElementById("staff-edit-preview-name");
    var metaEl = document.getElementById("staff-edit-preview-meta");
    var statusEl = document.getElementById("staff-edit-preview-status");
    if (avatar) avatar.textContent = initialsFromName(account.name);
    if (nameEl) nameEl.textContent = account.name || "—";
    if (metaEl) {
      metaEl.textContent = (account.email || "") + (account.username ? " · @" + account.username : "");
    }
    if (statusEl) {
      statusEl.className = "staff-status " + (account.is_active ? "active" : "inactive");
      statusEl.innerHTML = '<span class="staff-status-dot"></span>' +
        (account.is_active ? t("Active", "ସକ୍ରିୟ") : t("Inactive", "ନିଷ୍କ୍ରିୟ"));
    }
  }

  function setPasswordMode(mode) {
    var isCreate = mode === "create";
    if (passwordLabelText) {
      passwordLabelText.textContent = isCreate
        ? t("Password", "ପାସୱାର୍ଡ")
        : t("New password (optional)", "ନୂଆ ପାସୱାର୍ଡ (ଐଚ୍ଛିକ)");
    }
    if (passwordReq) passwordReq.classList.toggle("hidden", !isCreate);
    if (passwordHint) {
      passwordHint.textContent = isCreate
        ? t("Minimum 8 characters.", "ଅତିକମରେ ୮ ଅକ୍ଷର।")
        : t("Leave blank to keep the current password.", "ବର୍ତ୍ତମାନର ପାସୱାର୍ଡ ରଖିବାକୁ ଖାଲି ଛାଡ଼ନ୍ତୁ।");
    }
    if (pwdInput) pwdInput.required = isCreate;
  }

  function openModal(mode, account) {
    if (!modal || !form) return;
    var isEdit = mode === "edit";

    document.getElementById("staff-form-mode").value = mode;
    document.getElementById("staff-form-id").value = account ? account.id : "";

    if (modalCard) {
      modalCard.classList.toggle("staff-modal-card--create", !isEdit);
      modalCard.classList.toggle("staff-modal-card--edit", isEdit);
    }

    if (modalIcon) {
      modalIcon.textContent = isEdit ? "✎" : "＋";
      modalIcon.classList.toggle("staff-modal-icon--create", !isEdit);
      modalIcon.classList.toggle("staff-modal-icon--edit", isEdit);
    }

    document.getElementById("staff-modal-title").textContent = isEdit
      ? t("Edit account", "ଖାତା ସମ୍ପାଦନ")
      : t("Add account", "ଖାତା ଯୋଡ଼ନ୍ତୁ");

    if (modalSubtitle) {
      modalSubtitle.textContent = isEdit
        ? t("Update officer details. Leave password blank to keep the current one.", "ଅଧିକାରୀ ବିବରଣୀ ଅପଡେଟ୍ କରନ୍ତୁ। ବର୍ତ୍ତମାନର ପାସୱାର୍ଡ ରଖିବାକୁ ଖାଲି ଛାଡ଼ନ୍ତୁ।")
        : t("Official email is required for sign-in and password recovery.", "ସାଇନ ଇନ ଓ ପାସୱାର୍ଡ ପୁନରୁଦ୍ଧାର ପାଇଁ ଅଧିକାରତ୍ତ୍ୱ ଇମେଲ ଆବଶ୍ୟକ।");
    }

    if (saveBtn) {
      saveBtn.textContent = isEdit
        ? t("Save changes", "ପରିବର୍ତ୍ତନ ସଞ୍ଚୟ")
        : t("Create account", "ଖାତା ସୃଷ୍ଟି");
    }

    if (editPreview) {
      editPreview.classList.toggle("hidden", !isEdit);
      editPreview.setAttribute("aria-hidden", isEdit ? "false" : "true");
      if (isEdit && account) updateEditPreview(account);
    }

    document.getElementById("staff-name").value = account ? account.name : "";
    document.getElementById("staff-email").value = account ? account.email : "";
    document.getElementById("staff-username").value = account ? account.username : "";
    document.getElementById("staff-username").readOnly = isEdit;
    if (usernameBadge) usernameBadge.classList.toggle("hidden", !isEdit);
    document.getElementById("staff-designation").value = account ? account.designation : "";
    document.getElementById("staff-district").value = account ? account.district : "Odisha";
    document.getElementById("staff-phone").value = account ? account.phone : "";

    if (pwdInput) {
      pwdInput.value = "";
      pwdInput.type = "password";
    }
    if (pwToggle) {
      pwToggle.setAttribute("aria-pressed", "false");
      pwToggle.textContent = "👁";
    }
    setPasswordMode(mode);

    if (roleSelect) {
      roleSelect.value = account ? account.role : (cfg.manageableRoles[0] || "admin");
      roleSelect.disabled = isEdit;
    }
    if (document.getElementById("staff-osd-category")) {
      document.getElementById("staff-osd-category").value = account && account.osd_category
        ? account.osd_category
        : (cfg.osdCategories[0] || "");
    }
    document.getElementById("staff-whatsapp").checked = account ? !!account.whatsapp_enabled : false;
    document.getElementById("staff-active").checked = account ? !!account.is_active : true;
    document.getElementById("staff-active-wrap").classList.toggle("hidden", !isEdit);

    toggleRoleFields();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("staff-name").focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function applyTableFilters() {
    var query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    var status = statusFilter ? statusFilter.value : "all";
    var rows = document.querySelectorAll(".staff-row");
    var visible = 0;

    rows.forEach(function (row) {
      var haystack = row.getAttribute("data-search") || "";
      var active = row.getAttribute("data-active") === "true";
      var matchesQuery = !query || haystack.indexOf(query) >= 0;
      var matchesStatus = status === "all"
        || (status === "active" && active)
        || (status === "inactive" && !active);
      var show = matchesQuery && matchesStatus;
      row.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (noResults) {
      noResults.classList.toggle("is-visible", rows.length > 0 && visible === 0);
    }
  }

  async function apiRequest(method, path, body) {
    var opts = { method: method, credentials: "same-origin", headers: { Accept: "application/json" } };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    var res = await fetch(path, opts);
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.success) {
      var msg = (data.error && data.error.message) || "Request failed";
      throw new Error(msg);
    }
    return data.data;
  }

  function reloadSoon() {
    window.setTimeout(function () { window.location.reload(); }, 600);
  }

  if (roleSelect) roleSelect.addEventListener("change", toggleRoleFields);
  document.getElementById("staff-open-create")?.addEventListener("click", function () { openModal("create", null); });
  document.getElementById("staff-close-modal")?.addEventListener("click", closeModal);
  document.getElementById("staff-cancel-btn")?.addEventListener("click", closeModal);
  document.getElementById("staff-modal-backdrop")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (confirmDialog && confirmDialog.classList.contains("is-open")) {
      closeConfirm(false);
      return;
    }
    if (modal && modal.classList.contains("is-open")) closeModal();
  });

  document.getElementById("staff-confirm-cancel")?.addEventListener("click", function () {
    closeConfirm(false);
  });
  document.getElementById("staff-confirm-backdrop")?.addEventListener("click", function () {
    closeConfirm(false);
  });
  document.getElementById("staff-confirm-ok")?.addEventListener("click", function () {
    closeConfirm(true);
  });

  if (pwToggle && pwdInput) {
    pwToggle.addEventListener("click", function () {
      var show = pwdInput.type === "password";
      pwdInput.type = show ? "text" : "password";
      pwToggle.setAttribute("aria-pressed", show ? "true" : "false");
      pwToggle.textContent = show ? "🙈" : "👁";
    });
  }

  if (searchInput) searchInput.addEventListener("input", applyTableFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyTableFilters);

  document.querySelectorAll(".staff-edit-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var acc = accountById(btn.getAttribute("data-staff-id"));
      if (acc) openModal("edit", acc);
    });
  });

  document.querySelectorAll(".staff-deactivate-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var id = btn.getAttribute("data-staff-id");
      var account = accountById(id);
      var confirmed = await showDeactivateConfirm(account);
      if (!confirmed) return;
      try {
        await apiRequest("DELETE", "/api/staff/" + id);
        showFlash(t("Account deactivated", "ଖାତା ନିଷ୍କ୍ରିୟ ହେଲା"));
        reloadSoon();
      } catch (err) {
        showFlash(err.message, true);
      }
    });
  });

  document.querySelectorAll(".staff-activate-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var id = btn.getAttribute("data-staff-id");
      var account = accountById(id);
      var confirmed = await showActivateConfirm(account);
      if (!confirmed) return;
      try {
        await apiRequest("POST", "/api/staff/" + id + "/activate");
        showFlash(t("Account reactivated", "ଖାତା ପୁନର୍ବାର ସକ୍ରିୟ ହେଲା"));
        reloadSoon();
      } catch (err) {
        showFlash(err.message, true);
      }
    });
  });

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var mode = document.getElementById("staff-form-mode").value;
      var email = document.getElementById("staff-email").value.trim().toLowerCase();
      if (!email || email.indexOf("@") < 1) {
        showFlash(t("Valid official email is required", "ବୈଧ ଇମେଲ ଆବଶ୍ୟକ"), true);
        return;
      }

      var payload = {
        name: document.getElementById("staff-name").value.trim(),
        email: email,
        designation: document.getElementById("staff-designation").value.trim() || "OSD",
        district: document.getElementById("staff-district").value.trim() || "Odisha",
        phone: document.getElementById("staff-phone").value.trim(),
      };

      var pwd = document.getElementById("staff-password").value;
      if (pwd) payload.password = pwd;

      try {
        if (mode === "create") {
          payload.username = document.getElementById("staff-username").value.trim().toLowerCase();
          payload.role = roleSelect.value;
          payload.password = pwd;
          if (isOsdRole(payload.role)) {
            payload.osd_category = document.getElementById("staff-osd-category").value;
            payload.whatsapp_enabled = document.getElementById("staff-whatsapp").checked;
          }
          await apiRequest("POST", "/api/staff", payload);
          showFlash(t("Account created", "ଖାତା ସୃଷ୍ଟି ହେଲା"));
        } else {
          var id = document.getElementById("staff-form-id").value;
          if (isOsdRole(accountById(id)?.role)) {
            payload.osd_category = document.getElementById("staff-osd-category").value;
            payload.whatsapp_enabled = document.getElementById("staff-whatsapp").checked;
          }
          payload.is_active = document.getElementById("staff-active").checked;
          await apiRequest("PATCH", "/api/staff/" + id, payload);
          showFlash(t("Account updated", "ଖାତା ଅପଡେଟ୍ ହେଲା"));
        }
        closeModal();
        reloadSoon();
      } catch (err) {
        showFlash(err.message, true);
      }
    });
  }

  toggleRoleFields();
})();
