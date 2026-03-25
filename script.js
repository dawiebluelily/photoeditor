const state = {
  originalUrl: "",
  editedUrl: "",
  approved: false,
  editing: false,
  selectedTools: new Set(["brighten", "straighten"]),
  fileName: "",
};

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const editBtn = document.getElementById("editBtn");
const runEditBtn = document.getElementById("runEditBtn");
const resetBtn = document.getElementById("resetBtn");
const approveBtn = document.getElementById("approveBtn");
const reeditBtn = document.getElementById("reeditBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toolCards = document.querySelectorAll(".tool-card");
const selectedBadges = document.getElementById("selectedBadges");
const originalImage = document.getElementById("originalImage");
const editedImage = document.getElementById("editedImage");
const originalEmpty = document.getElementById("originalEmpty");
const editedEmpty = document.getElementById("editedEmpty");
const statusBadge = document.getElementById("statusBadge");
const editedSubtitle = document.getElementById("editedSubtitle");

const toolLabels = {
  brighten: "Brighten / Balance",
  straighten: "Straighten Lines",
  declutter: "Declutter",
  enhance: "Property24 Finish",
};

function renderBadges() {
  selectedBadges.innerHTML = "";
  if (state.selectedTools.size === 0) {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = "No tools selected";
    selectedBadges.appendChild(badge);
    return;
  }

  [...state.selectedTools].forEach((key) => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = toolLabels[key];
    selectedBadges.appendChild(badge);
  });
}

function renderStatus() {
  if (state.editing) {
    statusBadge.className = "status-badge working";
    statusBadge.textContent = "Working";
    editedSubtitle.textContent = "Processing...";
    statusBadge.classList.remove("hidden");
    return;
  }

  if (state.approved) {
    statusBadge.className = "status-badge approved";
    statusBadge.textContent = "Approved";
    editedSubtitle.textContent = "Approved result";
    statusBadge.classList.remove("hidden");
    return;
  }

  if (state.editedUrl) {
    statusBadge.classList.add("hidden");
    editedSubtitle.textContent = "Edited output";
    return;
  }

  statusBadge.classList.add("hidden");
  editedSubtitle.textContent = "Edited output";
}

function updateButtons() {
  const hasOriginal = !!state.originalUrl;
  const hasEdited = !!state.editedUrl;

  editBtn.disabled = !hasOriginal || state.editing;
  runEditBtn.disabled = !hasOriginal || state.editing;
  resetBtn.disabled = !hasOriginal;
  approveBtn.disabled = !hasEdited || state.editing;
  reeditBtn.disabled = !hasOriginal || state.editing;
  downloadBtn.disabled = !hasEdited || state.editing;

  editBtn.textContent = state.editing ? "Editing..." : "Edit Photo";
  runEditBtn.textContent = state.editing ? "Editing..." : "Run Edit";
}

function updateImages() {
  if (state.originalUrl) {
    originalImage.src = state.originalUrl;
    originalImage.hidden = false;
    originalEmpty.classList.add("hidden");
  } else {
    originalImage.src = "";
    originalImage.hidden = true;
    originalEmpty.classList.remove("hidden");
  }

  if (state.editedUrl) {
    editedImage.src = state.editedUrl;
    editedImage.hidden = false;
    editedEmpty.classList.add("hidden");
  } else {
    editedImage.src = "";
    editedImage.hidden = true;
    editedEmpty.classList.remove("hidden");
  }
}

function render() {
  renderBadges();
  renderStatus();
  updateButtons();
  updateImages();
}

function releaseObjectUrls() {
  if (state.originalUrl) URL.revokeObjectURL(state.originalUrl);
  if (state.editedUrl && state.editedUrl !== state.originalUrl) URL.revokeObjectURL(state.editedUrl);
}

function simulateEdit() {
  if (!state.originalUrl) return;
  state.editing = true;
  state.approved = false;
  render();

  window.setTimeout(() => {
    state.editedUrl = state.originalUrl;
    state.editing = false;
    render();
  }, 900);
}

uploadBtn.addEventListener("click", () => fileInput.click());
editBtn.addEventListener("click", simulateEdit);
runEditBtn.addEventListener("click", simulateEdit);
reeditBtn.addEventListener("click", () => {
  state.approved = false;
  simulateEdit();
});

approveBtn.addEventListener("click", () => {
  if (!state.editedUrl) return;
  state.approved = true;
  render();
});

resetBtn.addEventListener("click", () => {
  releaseObjectUrls();
  state.originalUrl = "";
  state.editedUrl = "";
  state.approved = false;
  state.editing = false;
  state.fileName = "";
  fileInput.value = "";
  render();
});

downloadBtn.addEventListener("click", () => {
  if (!state.editedUrl) return;
  const link = document.createElement("a");
  link.href = state.editedUrl;
  link.download = state.fileName ? `edited-${state.fileName}` : "edited-photo.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  releaseObjectUrls();
  state.originalUrl = URL.createObjectURL(file);
  state.editedUrl = "";
  state.approved = false;
  state.editing = false;
  state.fileName = file.name;
  render();
});

toolCards.forEach((card) => {
  card.addEventListener("click", () => {
    const key = card.dataset.tool;
    if (state.selectedTools.has(key)) {
      state.selectedTools.delete(key);
      card.classList.remove("active");
    } else {
      state.selectedTools.add(key);
      card.classList.add("active");
    }
    renderBadges();
  });
});

render();
