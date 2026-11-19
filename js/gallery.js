
(async () => {
  const $ = selector => document.querySelector(selector);

  const feat = $('[data-featured]');
  const prev = $('[data-preview]');
  const grid = $('[data-gallery]');
  const filt = $('[data-filters]');

  // Commission posters on commissions.html
  const commissionPosters = [
    ...document.querySelectorAll('.commission-poster')
  ];

  const hasArtworkContainers = Boolean(feat || prev || grid);

  // Stop only when this page has neither artwork nor commission posters
  if (!hasArtworkContainers && !commissionPosters.length) return;

  // Escape HTML to prevent unsafe content insertion
  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  // Generate accessible image descriptions
  const alt = artwork =>
    artwork.alt ||
    `${artwork.title}, ${artwork.medium || artwork.category || 'Artwork'}${
      artwork.year ? ' (' + artwork.year + ')' : ''
    }`;

  // Load artwork data only on pages that contain artwork sections
  let art = [];
  let artworkLoadFailed = false;

  if (hasArtworkContainers) {
    try {
      const response = await fetch('data/artworks.json');

      if (!response.ok) {
        throw new Error('Artwork data could not be loaded');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Artwork data must be a JSON array');
      }

      art = data.sort(
        (a, b) => (a.order ?? 999) - (b.order ?? 999)
      );

    } catch (error) {
      console.error(error);

      artworkLoadFailed = true;

      [feat, prev, grid].forEach(element => {
        if (element) {
          element.innerHTML = `
            <p class="msg">
              The artwork could not be loaded.
              Please refresh the page or try again shortly.
            </p>
          `;
        }
      });
    }
  }

  // Generate uniform artwork cards
  const card = (artwork, index) => `
    <button
      type="button"
      class="art"
      data-id="${esc(artwork.id)}"
      aria-label="View ${esc(artwork.title)} larger"
    >
      <span class="frame">
        <img
          src="${esc(artwork.thumbnail || artwork.image)}"
          alt="${esc(alt(artwork))}"
          width="480"
          height="640"
          ${index === 0 ? 'fetchpriority="high"' : ''}
          ${index > 1 ? 'loading="lazy"' : ''}
          decoding="async"
          onerror="this.closest('.art').hidden = true"
        >
      </span>

      <span class="cap">
        <b>${esc(artwork.title)}</b>
        <i>
          ${esc(artwork.category || 'Artwork')}
          ${artwork.year ? ', ' + esc(artwork.year) : ''}
        </i>
      </span>
    </button>
  `;

  // Track artwork associated with each gallery
  const lists = new Map();

  // Populate artwork containers
  const fill = (element, artworks) => {
    if (!element) return;

    lists.set(element, artworks);

    element.setAttribute('aria-busy', 'false');

    element.innerHTML = artworks.length
      ? artworks.map((artwork, index) =>
          card(artwork, index)
        ).join('')
      : '<p class="msg">No artwork available yet.</p>';
  };
  


  // Mobile gallery — highlight the artwork nearest the screen centre while scrolling
let highlightFrame = null;

const updateScrollHighlight = () => {
  if (!grid) return;

  // Only activate this behaviour on touch devices
  if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    grid.querySelectorAll('.art.is-scroll-active').forEach(card => {
      card.classList.remove('is-scroll-active');
    });
    return;
  }

  const cards = grid.querySelectorAll('.art');
  const screenCenter = window.innerHeight / 2;

  let closestCard = null;
  let closestDistance = Infinity;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();

    // Ignore cards outside the visible screen
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

    const cardCenter = (rect.top + rect.bottom) / 2;
    const distance = Math.abs(cardCenter - screenCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestCard = card;
    }
  });

  cards.forEach(card => {
    card.classList.toggle('is-scroll-active', card === closestCard);
  });
};

// Update the highlighted card efficiently while scrolling
const scheduleScrollHighlight = () => {
  if (highlightFrame !== null) return;

  highlightFrame = requestAnimationFrame(() => {
    updateScrollHighlight();
    highlightFrame = null;
  });
};

window.addEventListener('scroll', scheduleScrollHighlight, { passive: true });
window.addEventListener('resize', scheduleScrollHighlight);

  // Populate artwork sections only when data loaded successfully
  if (!artworkLoadFailed) {

    // Homepage featured artwork
    if (feat) {
      fill(
        feat,
        art.filter(artwork => artwork.featured).slice(0, 3)
      );
    }

    // Homepage selected artwork preview
    if (prev) {
      fill(
        prev,
        art.filter(artwork => artwork.selected === true).slice(0, 3)
      );
    }

    // Gallery: Selected Works and All Artwork
    if (grid) {
      const selectedArtwork = art.filter(
        artwork => artwork.selected === true
      );

      const allArtwork = art;

      let activeCollection = 'selected';

      const renderGallery = collection => {
        activeCollection = collection;

        const artworkToShow =
          collection === 'selected'
            ? selectedArtwork
            : allArtwork;

        fill(grid, artworkToShow);
        // Refresh the mobile scroll highlight after changing gallery collections
scheduleScrollHighlight();

        // Update active filter appearance
        if (filt) {
          filt.querySelectorAll('button').forEach(button => {
            const active =
              button.dataset.collection === collection;

            button.setAttribute('aria-pressed', String(active));
          });
        }
      };

      // Create only two gallery filters
      if (filt) {
        filt.innerHTML = `
          <button
            type="button"
            class="btn ghost"
            data-collection="selected"
            aria-pressed="true"
          >
            Selected Works
          </button>

          <button
            type="button"
            class="btn ghost"
            data-collection="all"
            aria-pressed="false"
          >
            All Artwork
          </button>
        `;

        filt.addEventListener('click', event => {
          const button = event.target.closest(
            'button[data-collection]'
          );

          if (!button) return;

          renderGallery(button.dataset.collection);
        });
      }

      // Show Selected Works by default
      renderGallery(activeCollection);
    }
  }

  // Convert commission posters into lightbox-compatible objects
  const commissionArtwork = commissionPosters.map(
    (button, index) => {
      const image = button.querySelector('img');

      return {
        id: String(index),
        image: image ? (image.currentSrc || image.src) : '',
        title: image?.alt || `Commission poster ${index + 1}`,
        alt: image?.alt || `Commission poster ${index + 1}`,
        category: 'Commission poster'
      };
    }
  );

  
  // =========================================
  // ADVANCED RESPONSIVE LIGHTBOX
  // Zoom, pan, swipe, pinch and navigation
  // =========================================

  const dialog = document.createElement('dialog');
  dialog.className = 'lb';
  dialog.setAttribute('aria-label', 'Artwork viewer');

  dialog.innerHTML = `
    <button class="lb-x" type="button" aria-label="Close viewer">×</button>

    <button class="lb-p" type="button" aria-label="Previous artwork">‹</button>

    <div class="lb-stage">
      <img class="lb-image" alt="" draggable="false">
    </div>

    <button class="lb-n" type="button" aria-label="Next artwork">›</button>

    <div class="lb-zoom-controls" aria-label="Zoom controls">
      <button class="lb-zoom-out" type="button" aria-label="Zoom out">−</button>
      <button class="lb-zoom-reset" type="button" aria-label="Reset zoom">Reset</button>
      <button class="lb-zoom-in" type="button" aria-label="Zoom in">+</button>
    </div>

    <figcaption class="lb-caption"></figcaption>
  `;

  document.body.append(dialog);

  const stage = dialog.querySelector('.lb-stage');
  const lightboxImage = dialog.querySelector('.lb-image');
  const caption = dialog.querySelector('.lb-caption');

  const closeButton = dialog.querySelector('.lb-x');
  const previousButton = dialog.querySelector('.lb-p');
  const nextButton = dialog.querySelector('.lb-n');
  const zoomInButton = dialog.querySelector('.lb-zoom-in');
  const zoomOutButton = dialog.querySelector('.lb-zoom-out');
  const zoomResetButton = dialog.querySelector('.lb-zoom-reset');

  let currentList = [];
  let currentIndex = 0;

  // Zoom configuration
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 1.3;

  let zoom = 1;
  let translateX = 0;
  let translateY = 0;

  let fitWidth = 0;
  let fitHeight = 0;

  // Pointer and gesture tracking
  const pointers = new Map();

  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;

  let startTranslateX = 0;
  let startTranslateY = 0;

  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let pinchLastCenter = null;

  let gestureMoved = false;
  let lastTouchTap = 0;

  // Keep image movement inside the visible viewer
  const clampPosition = () => {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;

    const maxX = Math.max(0, (fitWidth * zoom - stageWidth) / 2);
    const maxY = Math.max(0, (fitHeight * zoom - stageHeight) / 2);

    translateX = Math.max(-maxX, Math.min(maxX, translateX));
    translateY = Math.max(-maxY, Math.min(maxY, translateY));
  };

  // Apply image zoom and position
  const updateTransform = () => {
    clampPosition();

    lightboxImage.style.transform =
      `translate(${translateX}px, ${translateY}px) scale(${zoom})`;

    /* Use a normal cursor at default zoom and grab when zoomed */
lightboxImage.style.cursor =
  zoom > 1 ? 'grab' : 'default';

    stage.classList.toggle('is-zoomed', zoom > 1);
  };

  // Reset image to fit the viewer
  const resetZoom = () => {
    zoom = 1;
    translateX = 0;
    translateY = 0;

    updateTransform();
  };

  // Calculate the image's initial fit dimensions
  const fitImage = () => {
    if (!lightboxImage.naturalWidth || !lightboxImage.naturalHeight) {
      return;
    }

    const availableWidth = Math.max(100, stage.clientWidth * 0.88);
    const availableHeight = Math.max(100, stage.clientHeight * 0.76);

    // const ratio = Math.min(
    //   availableWidth / lightboxImage.naturalWidth,
    //   availableHeight / lightboxImage.naturalHeight,
    //   1
    // );
    const ratio = Math.min(
  availableWidth / lightboxImage.naturalWidth,
  availableHeight / lightboxImage.naturalHeight
);

    fitWidth = lightboxImage.naturalWidth * ratio;
    fitHeight = lightboxImage.naturalHeight * ratio;

    lightboxImage.style.width = `${fitWidth}px`;
    lightboxImage.style.height = `${fitHeight}px`;

    resetZoom();
  };

  // Zoom around a position inside the viewer
  const zoomAt = (newZoom, clientX, clientY) => {
    const oldZoom = zoom;

    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    if (zoom === MIN_ZOOM) {
      translateX = 0;
      translateY = 0;
    } else if (clientX !== undefined && clientY !== undefined) {
      const rect = stage.getBoundingClientRect();

      const pointX = clientX - rect.left - rect.width / 2;
      const pointY = clientY - rect.top - rect.height / 2;

      translateX =
        pointX - (pointX - translateX) * (zoom / oldZoom);

      translateY =
        pointY - (pointY - translateY) * (zoom / oldZoom);
    }

    updateTransform();
  };

  // Display artwork
  const show = index => {
    if (!currentList.length) return;

    currentIndex =
      (index + currentList.length) % currentList.length;

    const artwork = currentList[currentIndex];

    resetZoom();

    /* Hide the previous image while the next one loads */
lightboxImage.style.visibility = 'hidden';

lightboxImage.alt = alt(artwork);

caption.innerHTML = `
  <b>${esc(artwork.title)}</b>
  <br>
  ${esc([
    artwork.category,
    artwork.year,
    artwork.medium
  ].filter(Boolean).join(', '))}
  ${artwork.description
    ? '<br>' + esc(artwork.description)
    : ''}
`;

/* Show the new image only after it has loaded */
const handleImageLoad = () => {
  fitImage();
  lightboxImage.style.visibility = 'visible';
};

lightboxImage.onload = handleImageLoad;

lightboxImage.onerror = () => {
  lightboxImage.style.visibility = 'hidden';
};

lightboxImage.src = artwork.image;

/* Handle images that are already cached */
if (lightboxImage.complete && lightboxImage.naturalWidth) {
  handleImageLoad();
}
  };

  // Open artwork or commission poster
  document.addEventListener('click', event => {
    const button = event.target.closest(
      '.art, .commission-poster'
    );

    if (!button) return;

    let artworkList;
    let index;

    if (button.matches('.commission-poster')) {
      artworkList = commissionArtwork;
      index = commissionPosters.indexOf(button);
    } else {
      artworkList =
        lists.get(button.parentElement) || art;

      index = artworkList.findIndex(
        artwork => String(artwork.id) === button.dataset.id
      );
    }

    if (
      index < 0 ||
      index >= artworkList.length ||
      !artworkList[index]?.image
    ) {
      return;
    }

    currentList = artworkList;

    show(index);

    if (!dialog.open) {
      dialog.showModal();
    }
  });

  // Close viewer
  closeButton.addEventListener('click', () => dialog.close());

  // Previous and next artwork
  previousButton.addEventListener('click', () => {
    show(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    show(currentIndex + 1);
  });

  // Zoom buttons
  zoomInButton.addEventListener('click', () => {
    zoomAt(zoom * ZOOM_STEP);
  });

  zoomOutButton.addEventListener('click', () => {
    zoomAt(zoom / ZOOM_STEP);
  });

  zoomResetButton.addEventListener('click', resetZoom);

  // Mouse wheel zoom
  stage.addEventListener('wheel', event => {
    event.preventDefault();

    const factor = event.deltaY < 0
      ? ZOOM_STEP
      : 1 / ZOOM_STEP;

    zoomAt(
      zoom * factor,
      event.clientX,
      event.clientY
    );
  }, { passive: false });

  // Calculate distance between two touch points
  const getDistance = (a, b) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  // Calculate midpoint between two touch points
  const getCenter = (a, b) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  });

  // Pointer down: start drag, swipe or pinch
  stage.addEventListener('pointerdown', event => {
    if (!['touch', 'pen', 'mouse'].includes(event.pointerType)) return;

    event.preventDefault();

    stage.setPointerCapture(event.pointerId);

    pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });

    gestureMoved = false;

    if (pointers.size === 1) {
      startX = event.clientX;
      startY = event.clientY;

      lastX = event.clientX;
      lastY = event.clientY;

      startTranslateX = translateX;
      startTranslateY = translateY;
    }

    if (pointers.size === 2) {
      const points = [...pointers.values()];

      pinchStartDistance = getDistance(points[0], points[1]);
      pinchStartZoom = zoom;
      pinchLastCenter = getCenter(points[0], points[1]);
    }

    if (zoom > 1) {
      lightboxImage.style.cursor = 'grabbing';
    }
  });

  // Pointer move: pan or pinch zoom
  stage.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;

    pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    });

    if (pointers.size === 2) {
      const points = [...pointers.values()];

      const distance = getDistance(points[0], points[1]);
      const center = getCenter(points[0], points[1]);

      if (pinchStartDistance > 0) {
        const newZoom = pinchStartZoom *
          (distance / pinchStartDistance);

        zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

        if (pinchLastCenter) {
          translateX += center.x - pinchLastCenter.x;
          translateY += center.y - pinchLastCenter.y;
        }

        pinchLastCenter = center;

        updateTransform();
        gestureMoved = true;
      }

      return;
    }

    if (pointers.size === 1 && zoom > 1) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      translateX += dx;
      translateY += dy;

      lastX = event.clientX;
      lastY = event.clientY;

      updateTransform();
      gestureMoved = true;
    }

    if (
      Math.abs(event.clientX - startX) > 8 ||
      Math.abs(event.clientY - startY) > 8
    ) {
      gestureMoved = true;
    }
  });

  // Pointer up: finish gesture and detect mobile swipes
  const finishPointer = event => {
    if (!pointers.has(event.pointerId)) return;

    pointers.delete(event.pointerId);

    if (pointers.size < 2) {
      pinchStartDistance = 0;
      pinchLastCenter = null;
    }

    if (pointers.size === 0) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      // Swipe navigation when image is not zoomed
      if (!gestureMoved && zoom === 1) {
        const now = Date.now();

        if (
          event.pointerType === 'touch' &&
          now - lastTouchTap < 300
        ) {
          zoomAt(zoom === 1 ? 2.5 : 1);
          lastTouchTap = 0;
          return;
        }

        if (event.pointerType === 'touch') {
          lastTouchTap = now;
        }
      }

      if (zoom === 1 && Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          show(currentIndex + 1);
        } else {
          show(currentIndex - 1);
        }
      } else if (zoom === 1 && dy > 100 && Math.abs(dy) > Math.abs(dx)) {
        dialog.close();
      }

      if (!gestureMoved && zoom > 1) {
        // Keep zoomed image ready for the next drag
        updateTransform();
      }

      if (zoom === 1) {
        updateTransform();
      } else {
        lightboxImage.style.cursor = 'grab';
      }
    }
  };

  stage.addEventListener('pointerup', finishPointer);
  stage.addEventListener('pointercancel', finishPointer);

  // Double-click zoom on desktop
  stage.addEventListener('dblclick', event => {
    event.preventDefault();

    zoomAt(
      zoom === 1 ? 2.5 : 1,
      event.clientX,
      event.clientY
    );
  });

  // Keyboard navigation
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(currentIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(currentIndex + 1);
    }

    if (event.key === '+' || event.key === '=') {
      zoomAt(zoom * ZOOM_STEP);
    }

    if (event.key === '-') {
      zoomAt(zoom / ZOOM_STEP);
    }

    if (event.key === '0') {
      resetZoom();
    }
  });

  // Recalculate image dimensions when the viewer resizes
  window.addEventListener('resize', () => {
    if (dialog.open) {
      fitImage();
    }
  });

  // Clear gesture state when closing
  dialog.addEventListener('close', () => {
    pointers.clear();
    resetZoom();
  });

})();
