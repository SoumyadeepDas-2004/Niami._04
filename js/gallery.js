
(async () => {
  const $ = selector => document.querySelector(selector);

  const feat = $('[data-featured]');
  const prev = $('[data-preview]');
  const grid = $('[data-gallery]');
  const filt = $('[data-filters]');

  if (!feat && !prev && !grid) return;

  // Escape HTML to prevent unsafe content insertion
  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);

  // Load artwork data
  let art;

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

    return;
  }

  // Generate accessible image descriptions
  const alt = artwork =>
    artwork.alt ||
    `${artwork.title}, ${artwork.medium || artwork.category || 'Artwork'}${
      artwork.year ? ' (' + artwork.year + ')' : ''
    }`;

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
          src="${esc(artwork.image)}"
          alt="${esc(alt(artwork))}"
          ${artwork.width && artwork.height
            ? `width="${artwork.width}" height="${artwork.height}"`
            : ''}
          ${index > 2 ? 'loading="lazy"' : ''}
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

    element.innerHTML = artworks.length
      ? artworks.map((artwork, index) =>
          card(artwork, index)
        ).join('')
      : '<p class="msg">No artwork available yet.</p>';
  };

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
          data-collection="selected"
          aria-pressed="true"
        >
          Selected Works
        </button>

        <button
          type="button"
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

  // LIGHTBOX
  // Native dialog provides Escape and focus management

  const dialog = document.createElement('dialog');

  dialog.className = 'lb';

  dialog.setAttribute('aria-label', 'Artwork viewer');

  dialog.innerHTML = `
    <button class="lb-x" aria-label="Close">×</button>

    <button class="lb-p" aria-label="Previous artwork">‹</button>

    <figure>
      <img alt="">
      <figcaption></figcaption>
    </figure>

    <button class="lb-n" aria-label="Next artwork">›</button>
  `;

  document.body.append(dialog);

  const lightboxImage = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');

  let currentList = [];
  let currentIndex = 0;

  // Display artwork in lightbox
  const show = index => {
    if (!currentList.length) return;

    currentIndex =
      (index + currentList.length) % currentList.length;

    const artwork = currentList[currentIndex];

    lightboxImage.src = artwork.image;
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
  };

  // Open lightbox when artwork is clicked
  document.addEventListener('click', event => {
    const button = event.target.closest('.art');

    if (!button) return;

    const artworkList =
      lists.get(button.parentElement) || art;

    const index = artworkList.findIndex(
      artwork => String(artwork.id) === button.dataset.id
    );

    if (index < 0) return;

    currentList = artworkList;

    show(index);

    if (!dialog.open) {
      dialog.showModal();
    }
  });

  // Lightbox controls
  dialog.addEventListener('click', event => {
    if (event.target.closest('.lb-x')) {
      dialog.close();
    } else if (event.target.closest('.lb-p')) {
      show(currentIndex - 1);
    } else if (event.target.closest('.lb-n')) {
      show(currentIndex + 1);
    } else if (!event.target.closest('img, figcaption')) {
      dialog.close();
    }
  });

  // Keyboard navigation
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      show(currentIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      show(currentIndex + 1);
    }
  });

})();
