window.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded");
  initGalleryImages();
  initGalleryLazyLoad();
});

/*
<img
  data-src="img/gal/Elena-and-Chris-Engagement-Kelsey-Travis-Photography-91.jpg"
  alt="Wedding photo"
  class="gallery-img lazy"
  />
*/
const GALLERY_DIV_ID = "photo-gallery-container";

function initGalleryImages() {
  const images = getThumbnailUriList(0, undefined);

  images.forEach((uri) => {
    const img = document.createElement("img");
    img.dataset.src = uri;
    img.alt = "Wedding photo";
    img.classList.add("gallery-img", "lazy");

    document.getElementById(GALLERY_DIV_ID).appendChild(img);
  });
}

function initGalleryLazyLoad() {
  const imgs = document.querySelectorAll("img.lazy[data-src]");
  if (!imgs.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.addEventListener("load", () => img.classList.add("loaded"), {
            once: true,
          });
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: "200px" },
  );

  imgs.forEach((img) => observer.observe(img));
  initLightbox();
}

function initLightbox() {
  const overlay = document.createElement("div");
  overlay.id = "lightbox-overlay";

  const img = document.createElement("img");
  img.id = "lightbox-img";
  overlay.appendChild(img);

  document.body.appendChild(overlay);

  document.querySelectorAll(".gallery-img").forEach((galleryImg) => {
    galleryImg.style.cursor = "pointer";
    galleryImg.addEventListener("mouseenter", () => {
      console.log("Hovered on image " + galleryImg.src);
      img.src = galleryImg.src || galleryImg.dataset.src;
    });
    galleryImg.addEventListener("click", () => {
      console.log("Clicked on image " + galleryImg.src);
      const originalImgSource = galleryImg.src || galleryImg.dataset.src;
      const imageName = originalImgSource.substring(
        originalImgSource.lastIndexOf("/") + 1,
      );
      img.src = getPhotoUri(getFullSizeKey(imageName));
      overlay.classList.add("active");
    });
  });

  img.addEventListener("load", () => {
    console.log("Finished loading image " + img.src);
  });

  overlay.addEventListener("click", () => overlay.classList.remove("active"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.classList.remove("active");
  });
}

// Photo Providers

const BASE_URI = "https://d3fcs42rz5exiw.cloudfront.net/";

function getThumbnailUriList(start, end) {
  return getPhotoNameList(start, end).map(getThumbSizeKey).map(getPhotoUri);
}

function getPhotoNameList(start, end) {
  const photos = [];
  for (let i = 1; i <= 168; i++) {
    photos.push(`Elena-and-Chris-Wedding-Kelsey-Travis-Photography-${i}.jpg`);
  }
  return photos.slice(start, end);
}

function getFullSizeKey(photoName) {
  return `content/full/${photoName}`;
}

function getThumbSizeKey(photoName) {
  return `content/thumb/${photoName}`;
}

function getPhotoUri(photoKey) {
  return BASE_URI + photoKey;
}
