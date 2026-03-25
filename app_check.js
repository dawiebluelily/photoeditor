
    const CONTROLS = [
      { key: 'exposure', label: 'Exposure', min: -35, max: 35, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'contrast', label: 'Contrast', min: -25, max: 25, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'highlights', label: 'Highlights', min: -45, max: 45, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'shadows', label: 'Shadows', min: -45, max: 45, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'saturation', label: 'Saturation', min: -20, max: 25, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'warmth', label: 'Warmth', min: -20, max: 20, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'vibrance', label: 'Vibrance', min: -15, max: 25, step: 1, def: 0, target: 'lightControls', suffix: v => signed(v) },
      { key: 'clarity', label: 'Clarity', min: 0, max: 20, step: 1, def: 6, target: 'detailControls', suffix: v => v },
      { key: 'sharpen', label: 'Sharpen', min: 0, max: 20, step: 1, def: 6, target: 'detailControls', suffix: v => v },
      { key: 'straighten', label: 'Straighten', min: -6, max: 6, step: 0.1, def: 0, target: 'detailControls', suffix: v => `${Number(v).toFixed(1)}°` },
      { key: 'perspectiveX', label: 'Perspective left/right', min: -18, max: 18, step: 0.5, def: 0, target: 'detailControls', suffix: v => signedFixed(v) },
      { key: 'perspectiveY', label: 'Perspective top/bottom', min: -18, max: 18, step: 0.5, def: 0, target: 'detailControls', suffix: v => signedFixed(v) },
    ];

    const PRESETS = {
      interior: { exposure: 10, contrast: 2, highlights: -18, shadows: 18, saturation: 3, warmth: -2, vibrance: 10, clarity: 7, sharpen: 7, straighten: 0, perspectiveX: 0, perspectiveY: 0 },
      exterior: { exposure: 4, contrast: 5, highlights: -14, shadows: 8, saturation: 3, warmth: -1, vibrance: 6, clarity: 8, sharpen: 7, straighten: 0, perspectiveX: 0, perspectiveY: 0 },
      rental: { exposure: 12, contrast: 1, highlights: -12, shadows: 20, saturation: 4, warmth: 0, vibrance: 10, clarity: 6, sharpen: 6, straighten: 0, perspectiveX: 0, perspectiveY: 0 },
      luxury: { exposure: 6, contrast: -3, highlights: -10, shadows: 10, saturation: -1, warmth: 3, vibrance: 5, clarity: 5, sharpen: 5, straighten: 0, perspectiveX: 0, perspectiveY: 0 },
    };

    const state = {
      photos: [],
      currentId: null,
      copiedSettings: null,
      viewMode: 'split',
      showGrid: false,
      renderToken: 0,
    };

    const queueList = document.getElementById('queueList');
    const queueSummary = document.getElementById('queueSummary');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const originalCanvas = document.getElementById('originalCanvas');
    const editedCanvas = document.getElementById('editedCanvas');
    const originalMeta = document.getElementById('originalMeta');
    const editedMeta = document.getElementById('editedMeta');
    const currentFileLabel = document.getElementById('currentFileLabel');
    const analysisBox = document.getElementById('analysisBox');
    const viewerEmpty = document.getElementById('viewerEmpty');
    const viewerContent = document.getElementById('viewerContent');
    const originalCard = document.getElementById('originalCard');
    const editedCard = document.getElementById('editedCard');
    const originalGrid = document.getElementById('originalGrid');
    const editedGrid = document.getElementById('editedGrid');

    const analyzeBtn = document.getElementById('analyzeBtn');
    const applyCurrentToAllBtn = document.getElementById('applyCurrentToAllBtn');
    const applySuggestedToAllBtn = document.getElementById('applySuggestedToAllBtn');
    const copySettingsBtn = document.getElementById('copySettingsBtn');
    const pasteSettingsBtn = document.getElementById('pasteSettingsBtn');
    const resetPhotoBtn = document.getElementById('resetPhotoBtn');
    const markReviewedBtn = document.getElementById('markReviewedBtn');
    const toggleGridBtn = document.getElementById('toggleGridBtn');
    const clearQueueBtn = document.getElementById('clearQueueBtn');
    const exportCurrentBtn = document.getElementById('exportCurrentBtn');
    const exportReviewedBtn = document.getElementById('exportReviewedBtn');
    const exportAllBtn = document.getElementById('exportAllBtn');

    buildControls();
    bindEvents();
    refreshUI();

    function bindEvents() {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => addFiles([...e.target.files]));

      ['dragenter','dragover'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave','drop'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => addFiles([...e.dataTransfer.files]));

      document.getElementById('viewModeGroup').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-view]');
        if (!btn) return;
        state.viewMode = btn.dataset.view;
        [...document.querySelectorAll('#viewModeGroup button')].forEach(b => b.classList.toggle('active', b === btn));
        updateViewMode();
      });

      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const photo = getCurrentPhoto();
          if (!photo) return;
          const preset = PRESETS[btn.dataset.preset];
          photo.settings = mergeSettings(preset);
          photo.status = 'ready';
          updateControlValues(photo.settings);
          refreshQueue();
          renderCurrentPhoto();
        });
      });

      analyzeBtn.addEventListener('click', () => {
        const photo = getCurrentPhoto();
        if (!photo) return;
        applySuggestedSettings(photo, true);
      });

      applyCurrentToAllBtn.addEventListener('click', () => {
        const photo = getCurrentPhoto();
        if (!photo) return;
        const source = { ...photo.settings };
        state.photos.forEach(p => {
          p.settings = mergeSettings(source);
          if (p.id !== photo.id) p.status = 'ready';
        });
        refreshQueue();
      });

      applySuggestedToAllBtn.addEventListener('click', () => {
        state.photos.forEach(photo => applySuggestedSettings(photo, false));
        if (state.currentId !== null) {
          const current = getCurrentPhoto();
          updateControlValues(current.settings);
          renderCurrentPhoto();
        }
        refreshQueue();
      });

      copySettingsBtn.addEventListener('click', () => {
        const photo = getCurrentPhoto();
        if (!photo) return;
        state.copiedSettings = { ...photo.settings };
        pasteSettingsBtn.disabled = false;
      });

      pasteSettingsBtn.addEventListener('click', () => {
        const photo = getCurrentPhoto();
        if (!photo || !state.copiedSettings) return;
        photo.settings = mergeSettings(state.copiedSettings);
        photo.status = 'ready';
        updateControlValues(photo.settings);
        refreshQueue();
        renderCurrentPhoto();
      });

      resetPhotoBtn.addEventListener('click', () => {
        const photo = getCurrentPhoto();
        if (!photo) return;
        photo.settings = mergeSettings(photo.suggestedSettings);
        photo.status = 'ready';
        updateControlValues(photo.settings);
        refreshQueue();
        renderCurrentPhoto();
      });

      markReviewedBtn.addEventListener('click', () => {
        const photo = getCurrentPhoto();
        if (!photo) return;
        photo.status = 'reviewed';
        refreshQueue();
        refreshUI();
      });

      toggleGridBtn.addEventListener('click', () => {
        state.showGrid = !state.showGrid;
        toggleGridBtn.textContent = state.showGrid ? 'Hide alignment grid' : 'Show alignment grid';
        originalGrid.classList.toggle('show', state.showGrid);
        editedGrid.classList.toggle('show', state.showGrid);
      });

      clearQueueBtn.addEventListener('click', clearQueue);
      exportCurrentBtn.addEventListener('click', async () => {
        const photo = getCurrentPhoto();
        if (!photo) return;
        await exportPhotos([photo], false);
      });
      exportReviewedBtn.addEventListener('click', async () => {
        const reviewed = state.photos.filter(p => p.status === 'reviewed');
        if (!reviewed.length) return;
        await exportPhotos(reviewed, true);
      });
      exportAllBtn.addEventListener('click', async () => {
        if (!state.photos.length) return;
        await exportPhotos(state.photos, true);
      });
    }

    function buildControls() {
      CONTROLS.forEach(ctrl => {
        const wrap = document.createElement('div');
        wrap.className = 'control';
        wrap.innerHTML = `
          <div class="label-row">
            <label for="ctrl-${ctrl.key}">${ctrl.label}</label>
            <div class="value" id="val-${ctrl.key}">${ctrl.suffix(ctrl.def)}</div>
          </div>
          <input id="ctrl-${ctrl.key}" type="range" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}" value="${ctrl.def}" />
        `;
        document.getElementById(ctrl.target).appendChild(wrap);

        wrap.querySelector('input').addEventListener('input', (e) => {
          const photo = getCurrentPhoto();
          if (!photo) return;
          const value = Number(e.target.value);
          photo.settings[ctrl.key] = value;
          photo.status = 'ready';
          document.getElementById(`val-${ctrl.key}`).textContent = ctrl.suffix(value);
          refreshQueue();
          renderCurrentPhoto();
        });
      });
    }

    function addFiles(fileList) {
      const supported = fileList.filter(file => /image\/(jpeg|png|webp)/i.test(file.type));
      if (!supported.length) return;

      supported.forEach(file => {
        const duplicate = state.photos.some(p => p.name === file.name && p.size === file.size && p.lastModified === file.lastModified);
        if (duplicate) return;

        const photo = {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          status: 'pending',
          image: null,
          thumbUrl: URL.createObjectURL(file),
          stats: null,
          suggestedSettings: mergeSettings({}),
          settings: mergeSettings({}),
          originalPreviewCanvas: null,
          editedPreviewCanvas: null,
        };
        state.photos.push(photo);
      });

      fileInput.value = '';
      hydratePhotos(supported).catch(console.error);
      refreshQueue();
      refreshUI();
    }

    async function hydratePhotos() {
      for (const photo of state.photos) {
        if (photo.image) continue;
        photo.image = await loadImage(photo.file);
        photo.stats = analyzeImage(photo.image);
        photo.suggestedSettings = suggestSettings(photo.stats);
        photo.settings = mergeSettings(photo.suggestedSettings);
        photo.status = 'ready';
      }

      if (!state.currentId && state.photos.length) {
        state.currentId = state.photos[0].id;
      }

      const current = getCurrentPhoto();
      if (current) {
        updateControlValues(current.settings);
        renderCurrentPhoto();
      }
      refreshQueue();
      refreshUI();
    }

    function analyzeImage(img) {
      const maxSide = 320;
      const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * ratio));
      const h = Math.max(1, Math.round(img.height * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      let lumSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let satSum = 0;
      let brightPixels = 0;
      let darkPixels = 0;
      let blueSkyish = 0;
      let greenish = 0;
      const lumValues = [];
      const edgeMagnitudes = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lumSum += lum;
        rSum += r;
        gSum += g;
        bSum += b;
        satSum += max === 0 ? 0 : ((max - min) / max);
        lumValues.push(lum);
        if (lum > 205) brightPixels++;
        if (lum < 65) darkPixels++;
        if (b > r + 18 && b > g + 8 && lum > 110) blueSkyish++;
        if (g > r + 10 && g > b - 5 && lum > 70) greenish++;
      }

      const total = data.length / 4;
      lumValues.sort((a, b) => a - b);
      const p10 = lumValues[Math.floor(total * 0.10)];
      const p50 = lumValues[Math.floor(total * 0.50)];
      const p90 = lumValues[Math.floor(total * 0.90)];
      const avgLum = lumSum / total;
      const avgR = rSum / total;
      const avgG = gSum / total;
      const avgB = bSum / total;
      const saturation = satSum / total;
      const brightRatio = brightPixels / total;
      const darkRatio = darkPixels / total;
      const outdoorLikelihood = clamp01((blueSkyish / total) * 3 + (greenish / total) * 2 + (p90 > 210 ? 0.15 : 0));
      const whiteBalanceBias = avgR - avgB;

      // Fast edge / detail estimate
      for (let y = 1; y < h - 1; y += 2) {
        for (let x = 1; x < w - 1; x += 2) {
          const idx = (y * w + x) * 4;
          const idxR = (y * w + (x + 1)) * 4;
          const idxB = ((y + 1) * w + x) * 4;
          const lumC = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
          const lumR = 0.2126 * data[idxR] + 0.7152 * data[idxR + 1] + 0.0722 * data[idxR + 2];
          const lumB = 0.2126 * data[idxB] + 0.7152 * data[idxB + 1] + 0.0722 * data[idxB + 2];
          edgeMagnitudes.push(Math.abs(lumC - lumR) + Math.abs(lumC - lumB));
        }
      }
      const detailScore = edgeMagnitudes.length
        ? edgeMagnitudes.reduce((sum, v) => sum + v, 0) / edgeMagnitudes.length
        : 0;

      return {
        width: img.width,
        height: img.height,
        avgLum,
        p10,
        p50,
        p90,
        brightRatio,
        darkRatio,
        outdoorLikelihood,
        whiteBalanceBias,
        avgR,
        avgG,
        avgB,
        saturation,
        detailScore,
      };
    }

    function suggestSettings(stats) {
      const exposure = clamp(Math.round((132 - stats.avgLum) * 0.16), -8, 18);
      const shadows = clamp(Math.round((0.22 - stats.darkRatio) * -120), -8, 24);
      const highlights = clamp(Math.round((stats.brightRatio - 0.16) * -90), -24, 10);
      const contrast = clamp(Math.round((118 - (stats.p90 - stats.p10)) * 0.08), -8, 12);
      const warmth = clamp(Math.round((stats.whiteBalanceBias * -0.07)), -10, 10);
      const vibrance = clamp(Math.round((0.22 - stats.saturation) * 40), 0, 14);
      const saturation = clamp(stats.outdoorLikelihood > 0.45 ? 2 : 4, -5, 8);
      const clarity = clamp(Math.round(8 - stats.detailScore * 0.04), 4, 10);
      const sharpen = clamp(Math.round(7 - stats.detailScore * 0.02), 4, 9);

      return mergeSettings({
        exposure,
        contrast,
        highlights,
        shadows,
        saturation,
        warmth,
        vibrance,
        clarity,
        sharpen,
        straighten: 0,
        perspectiveX: 0,
        perspectiveY: 0,
      });
    }

    function applySuggestedSettings(photo, rerender = true) {
      if (!photo.stats) return;
      photo.suggestedSettings = suggestSettings(photo.stats);
      photo.settings = mergeSettings(photo.suggestedSettings);
      photo.status = 'ready';
      if (getCurrentPhoto()?.id === photo.id) {
        updateControlValues(photo.settings);
        if (rerender) renderCurrentPhoto();
      }
      refreshQueue();
    }

    function mergeSettings(override) {
      const base = {};
      CONTROLS.forEach(ctrl => { base[ctrl.key] = ctrl.def; });
      return { ...base, ...override };
    }

    function updateControlValues(settings) {
      CONTROLS.forEach(ctrl => {
        const input = document.getElementById(`ctrl-${ctrl.key}`);
        const valueEl = document.getElementById(`val-${ctrl.key}`);
        input.value = settings[ctrl.key];
        valueEl.textContent = ctrl.suffix(settings[ctrl.key]);
      });
    }

    function refreshQueue() {
      queueList.innerHTML = '';
      state.photos.forEach(photo => {
        const item = document.createElement('div');
        item.className = `queue-item ${photo.id === state.currentId ? 'active' : ''}`;
        item.addEventListener('click', () => selectPhoto(photo.id));
        const sizeMb = (photo.size / 1024 / 1024).toFixed(1);
        item.innerHTML = `
          <img src="${photo.thumbUrl}" alt="${escapeHtml(photo.name)}" />
          <div class="queue-main">
            <strong>${escapeHtml(photo.name)}</strong>
            <span>${sizeMb} MB • ${photo.stats ? `${photo.stats.width} × ${photo.stats.height}` : 'Loading…'}</span>
            <span class="queue-meta">${photo.stats ? describePhoto(photo.stats) : 'Preparing photo analysis…'}</span>
          </div>
          <div class="status-pill ${photo.status}">${labelStatus(photo.status)}</div>
        `;
        queueList.appendChild(item);
      });

      if (!state.photos.length) {
        queueSummary.textContent = 'No photos loaded yet.';
      } else {
        const reviewed = state.photos.filter(p => p.status === 'reviewed').length;
        queueSummary.textContent = `${state.photos.length} photo${state.photos.length === 1 ? '' : 's'} loaded • ${reviewed} reviewed`;
      }
    }

    function selectPhoto(photoId) {
      state.currentId = photoId;
      const photo = getCurrentPhoto();
      if (!photo) return;
      updateControlValues(photo.settings);
      renderCurrentPhoto();
      refreshQueue();
      refreshUI();
    }

    function refreshUI() {
      const photo = getCurrentPhoto();
      const hasPhotos = state.photos.length > 0;
      const hasReviewed = state.photos.some(p => p.status === 'reviewed');

      applyCurrentToAllBtn.disabled = !photo;
      applySuggestedToAllBtn.disabled = !hasPhotos;
      analyzeBtn.disabled = !photo;
      copySettingsBtn.disabled = !photo;
      pasteSettingsBtn.disabled = !photo || !state.copiedSettings;
      resetPhotoBtn.disabled = !photo;
      markReviewedBtn.disabled = !photo;
      toggleGridBtn.disabled = !photo;
      clearQueueBtn.disabled = !hasPhotos;
      exportCurrentBtn.disabled = !photo;
      exportReviewedBtn.disabled = !hasReviewed;
      exportAllBtn.disabled = !hasPhotos;

      viewerEmpty.style.display = photo ? 'none' : 'block';
      viewerContent.style.display = photo ? 'block' : 'none';

      if (photo) {
        currentFileLabel.textContent = `${photo.name} • Review this edit before exporting.`;
        analysisBox.innerHTML = buildAnalysisHtml(photo);
      } else {
        currentFileLabel.textContent = '';
        analysisBox.innerHTML = '<strong>Waiting for photo.</strong><br>Suggested adjustments will appear here after you load an image.';
      }

      updateViewMode();
    }

    function updateViewMode() {
      if (state.viewMode === 'split') {
        originalCard.style.display = 'block';
        editedCard.style.display = 'block';
      } else if (state.viewMode === 'edited') {
        originalCard.style.display = 'none';
        editedCard.style.display = 'block';
      } else {
        originalCard.style.display = 'block';
        editedCard.style.display = 'none';
      }
    }

    async function renderCurrentPhoto() {
      const photo = getCurrentPhoto();
      if (!photo || !photo.image) return;
      const token = ++state.renderToken;

      originalMeta.textContent = `${photo.stats.width} × ${photo.stats.height}`;
      editedMeta.textContent = `Preview with current settings`;

      const originalPreview = renderToCanvas(photo.image, mergeSettings({}), 1400, false);
      if (token !== state.renderToken) return;
      drawCanvasToCanvas(originalPreview, originalCanvas);
      fitOverlayToCanvas(originalGrid, originalCanvas);

      const editedPreview = await renderToCanvas(photo.image, photo.settings, 1400, true);
      if (token !== state.renderToken) return;
      drawCanvasToCanvas(editedPreview, editedCanvas);
      fitOverlayToCanvas(editedGrid, editedCanvas);

      photo.originalPreviewCanvas = originalPreview;
      photo.editedPreviewCanvas = editedPreview;
      refreshUI();
    }

    function renderToCanvas(image, settings, maxEdge, applyGeometry) {
      const scaled = drawScaledImage(image, maxEdge);
      let working = scaled;

      if (applyGeometry) {
        if (Math.abs(settings.straighten) > 0.01) {
          working = rotateAndCropCanvas(working, settings.straighten);
        }
        if (Math.abs(settings.perspectiveX) > 0.01) {
          working = warpHorizontalPerspective(working, settings.perspectiveX / 100);
        }
        if (Math.abs(settings.perspectiveY) > 0.01) {
          working = warpVerticalPerspective(working, settings.perspectiveY / 100);
        }
      }

      const toned = adjustCanvasPixels(working, settings);
      let detailed = toned;

      if (settings.clarity > 0) {
        detailed = applyUnsharpMask(detailed, settings.clarity * 0.6, 1.2);
      }
      if (settings.sharpen > 0) {
        detailed = applyUnsharpMask(detailed, settings.sharpen * 0.4, 0.7);
      }
      return detailed;
    }

    function drawScaledImage(image, maxEdge) {
      const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);
      return canvas;
    }

    function rotateAndCropCanvas(sourceCanvas, degrees) {
      const radians = degrees * Math.PI / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;
      const boundW = Math.ceil(w * cos + h * sin);
      const boundH = Math.ceil(w * sin + h * cos);

      const temp = document.createElement('canvas');
      temp.width = boundW;
      temp.height = boundH;
      const tctx = temp.getContext('2d');
      tctx.translate(boundW / 2, boundH / 2);
      tctx.rotate(radians);
      tctx.drawImage(sourceCanvas, -w / 2, -h / 2);

      const cropW = Math.max(1, Math.floor(w * (1 - sin * 0.7)));
      const cropH = Math.max(1, Math.floor(h * (1 - sin * 0.7)));
      const sx = Math.max(0, Math.floor((boundW - cropW) / 2));
      const sy = Math.max(0, Math.floor((boundH - cropH) / 2));

      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const octx = out.getContext('2d');
      octx.drawImage(temp, sx, sy, cropW, cropH, 0, 0, w, h);
      return out;
    }

    function warpHorizontalPerspective(sourceCanvas, amount) {
      const src = sourceCanvas;
      const w = src.width;
      const h = src.height;
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const ctx = out.getContext('2d');
      const strength = Math.max(-0.18, Math.min(0.18, amount));

      for (let y = 0; y < h; y++) {
        const t = y / (h - 1 || 1);
        const localScale = 1 - strength * ((t * 2) - 1);
        const sliceH = 1;
        const sliceW = Math.max(1, Math.round(w * localScale));
        const dx = (w - sliceW) / 2;
        ctx.drawImage(src, 0, y, w, sliceH, dx, y, sliceW, sliceH);
      }
      return out;
    }

    function warpVerticalPerspective(sourceCanvas, amount) {
      const src = sourceCanvas;
      const w = src.width;
      const h = src.height;
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const ctx = out.getContext('2d');
      const strength = Math.max(-0.18, Math.min(0.18, amount));

      for (let x = 0; x < w; x++) {
        const t = x / (w - 1 || 1);
        const localScale = 1 - strength * ((t * 2) - 1);
        const sliceW = 1;
        const sliceH = Math.max(1, Math.round(h * localScale));
        const dy = (h - sliceH) / 2;
        ctx.drawImage(src, x, 0, sliceW, h, x, dy, sliceW, sliceH);
      }
      return out;
    }

    function adjustCanvasPixels(sourceCanvas, settings) {
      const out = document.createElement('canvas');
      out.width = sourceCanvas.width;
      out.height = sourceCanvas.height;
      const ctx = out.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(sourceCanvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, out.width, out.height);
      const data = imageData.data;

      const expFactor = settings.exposure / 100;
      const contrastFactor = settings.contrast / 100;
      const highlightFactor = settings.highlights / 100;
      const shadowFactor = settings.shadows / 100;
      const satFactor = settings.saturation / 100;
      const warm = settings.warmth;
      const vibrance = settings.vibrance / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i + 1] / 255;
        let b = data[i + 2] / 255;

        // Exposure
        r = clamp01(r + expFactor);
        g = clamp01(g + expFactor);
        b = clamp01(b + expFactor);

        // Shadows / highlights on luminance
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const shadowWeight = Math.max(0, 1 - lum) * Math.max(0, 1 - lum);
        const highlightWeight = lum * lum;
        r = clamp01(r + shadowWeight * shadowFactor * 0.55 - highlightWeight * highlightFactor * 0.45);
        g = clamp01(g + shadowWeight * shadowFactor * 0.55 - highlightWeight * highlightFactor * 0.45);
        b = clamp01(b + shadowWeight * shadowFactor * 0.55 - highlightWeight * highlightFactor * 0.45);

        // Warmth
        r = clamp01(r + warm * 0.003);
        b = clamp01(b - warm * 0.003);
        g = clamp01(g + warm * 0.0007);

        // Contrast around midtone
        r = clamp01(((r - 0.5) * (1 + contrastFactor)) + 0.5);
        g = clamp01(((g - 0.5) * (1 + contrastFactor)) + 0.5);
        b = clamp01(((b - 0.5) * (1 + contrastFactor)) + 0.5);

        // Saturation + vibrance
        const avg = (r + g + b) / 3;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const vibBoost = (1 - sat) * vibrance;
        const totalSat = satFactor + vibBoost;
        r = clamp01(avg + (r - avg) * (1 + totalSat));
        g = clamp01(avg + (g - avg) * (1 + totalSat));
        b = clamp01(avg + (b - avg) * (1 + totalSat));

        data[i] = Math.round(r * 255);
        data[i + 1] = Math.round(g * 255);
        data[i + 2] = Math.round(b * 255);
      }

      ctx.putImageData(imageData, 0, 0);
      return out;
    }

    function applyUnsharpMask(sourceCanvas, amount, blurPx) {
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;
      const blurred = document.createElement('canvas');
      blurred.width = w;
      blurred.height = h;
      const bctx = blurred.getContext('2d');
      bctx.filter = `blur(${blurPx}px)`;
      bctx.drawImage(sourceCanvas, 0, 0);

      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const octx = out.getContext('2d', { willReadFrequently: true });
      octx.drawImage(sourceCanvas, 0, 0);

      const srcData = octx.getImageData(0, 0, w, h);
      const blurData = bctx.getImageData(0, 0, w, h);
      const src = srcData.data;
      const blur = blurData.data;

      for (let i = 0; i < src.length; i += 4) {
        src[i] = clampByte(src[i] + (src[i] - blur[i]) * amount * 0.08);
        src[i + 1] = clampByte(src[i + 1] + (src[i + 1] - blur[i + 1]) * amount * 0.08);
        src[i + 2] = clampByte(src[i + 2] + (src[i + 2] - blur[i + 2]) * amount * 0.08);
      }

      octx.putImageData(srcData, 0, 0);
      return out;
    }

    function drawCanvasToCanvas(source, target) {
      target.width = source.width;
      target.height = source.height;
      const ctx = target.getContext('2d');
      ctx.clearRect(0, 0, target.width, target.height);
      ctx.drawImage(source, 0, 0);
    }

    function fitOverlayToCanvas(overlay, canvas) {
      overlay.style.left = '12px';
      overlay.style.right = '12px';
      overlay.style.top = '12px';
      overlay.style.bottom = '12px';
    }

    async function exportPhotos(photos, zipMode) {
      const mode = document.getElementById('exportModeSelect').value;
      const quality = Number(document.getElementById('jpegQualitySelect').value);
      const sizeModes = mode === 'both' ? ['web', 'portal'] : [mode];
      const sizes = { web: 2048, portal: 1600 };

      if (zipMode && typeof JSZip === 'undefined') {
        alert('ZIP library did not load. Use single-photo export or open the app while online so JSZip can load.');
        return;
      }

      if (!zipMode && photos.length === 1 && sizeModes.length <= 2) {
        const photo = photos[0];
        for (const sizeMode of sizeModes) {
          const canvas = renderToCanvas(photo.image, photo.settings, sizes[sizeMode], true);
          const blob = await canvasToBlob(canvas, quality);
          downloadBlob(blob, makeExportName(photo.name, sizeMode));
        }
        return;
      }

      const zip = new JSZip();
      for (const photo of photos) {
        for (const sizeMode of sizeModes) {
          const canvas = renderToCanvas(photo.image, photo.settings, sizes[sizeMode], true);
          const blob = await canvasToBlob(canvas, quality);
          zip.file(makeExportName(photo.name, sizeMode), blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const suffix = zipMode && photos.every(p => p.status === 'reviewed') ? 'reviewed' : 'export';
      downloadBlob(content, `property-photo-${suffix}.zip`);
    }

    function getCurrentPhoto() {
      return state.photos.find(photo => photo.id === state.currentId) || null;
    }

    function clearQueue() {
      state.photos.forEach(photo => URL.revokeObjectURL(photo.thumbUrl));
      state.photos = [];
      state.currentId = null;
      state.copiedSettings = null;
      queueList.innerHTML = '';
      originalCanvas.width = 0;
      originalCanvas.height = 0;
      editedCanvas.width = 0;
      editedCanvas.height = 0;
      refreshUI();
      refreshQueue();
    }

    function buildAnalysisHtml(photo) {
      if (!photo.stats) return '<strong>Analyzing…</strong>';
      const s = photo.stats;
      const scene = s.outdoorLikelihood > 0.45 ? 'Likely exterior photo.' : 'Likely interior photo.';
      const light = s.avgLum < 105 ? 'Room appears a bit dark.' : s.avgLum > 165 ? 'Image is already bright.' : 'Exposure sits in a usable middle range.';
      const wb = s.whiteBalanceBias > 12 ? 'Warm cast detected.' : s.whiteBalanceBias < -12 ? 'Cool cast detected.' : 'Colour balance looks fairly neutral.';
      return `
        <strong>${scene}</strong><br>
        ${light} ${wb}<br><br>
        <strong>Suggested start:</strong> Exposure ${signed(photo.suggestedSettings.exposure)}, Shadows ${signed(photo.suggestedSettings.shadows)}, Highlights ${signed(photo.suggestedSettings.highlights)}, Warmth ${signed(photo.suggestedSettings.warmth)}.<br>
        Use the grid before exporting if walls or door frames still look off.
      `;
    }

    function describePhoto(stats) {
      const type = stats.outdoorLikelihood > 0.45 ? 'Exterior' : 'Interior';
      const tone = stats.avgLum < 105 ? 'dark' : stats.avgLum > 165 ? 'bright' : 'balanced';
      return `${type} • ${tone} light`;
    }

    function labelStatus(status) {
      if (status === 'reviewed') return 'Reviewed';
      if (status === 'ready') return 'Ready';
      return 'Pending';
    }

    function makeExportName(name, mode) {
      const base = name.replace(/\.[^.]+$/, '');
      return `${base}_${mode}.jpg`;
    }

    function loadImage(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }

    function canvasToBlob(canvas, quality) {
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    }

    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function signed(value) {
      return `${value > 0 ? '+' : ''}${value}`;
    }

    function signedFixed(value) {
      const num = Number(value);
      return `${num > 0 ? '+' : ''}${num.toFixed(1)}`;
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function clamp01(value) {
      return Math.max(0, Math.min(1, value));
    }

    function clampByte(value) {
      return Math.max(0, Math.min(255, Math.round(value)));
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    }
  