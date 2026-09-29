window.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded");
  await initGalleryImages();
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

async function initGalleryImages() {
  console.log("Initializing image gallery");
  const images = await getThumbnailDataList(0, undefined);

  console.log("Retrieved image list");
  images.forEach(({ uri, aspect_ratio }) => {
    const img = document.createElement("img");
    img.dataset.src = uri;
    img.alt = "Wedding photo";
    img.classList.add("gallery-img", "lazy");
    img.style.aspectRatio = aspect_ratio;

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
    { rootMargin: "50px" },
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
      const fullImageSrc = originalImgSource.replace("thumb", "full");
      img.src = fullImageSrc;
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
const MANIFEST_URI = "http://localhost:8080/"; //BASE_URI;

const MANIFEST_KEY = "distribution/manifest.json";

async function getThumbnailDataList(start, end) {
  const photoNameList = await getPhotoNameList(start, end);

  const res = Object.keys(photoNameList).flatMap((category) =>
    photoNameList[category].map((imageData) => {
      return {
        uri: getPhotoUri(getThumbSizeKey(category, imageData["name"])),
        aspect_ratio: imageData.aspect_ratio,
      };
    }),
  );

  console.log("Found photo name thumbnail list: ", res);

  return res;
}

async function getPhotoNameList(start, end) {
  const manifestResponse = await fetch(MANIFEST_URI + MANIFEST_KEY);

  if (!manifestResponse.ok) {
    throw new Error("Failed to retrieve photo manifest");
  }

  const manifestData = await manifestResponse.json();

  console.log(manifestData);

  return manifestData;
}

function getFullSizeKey(category, photoName) {
  return `content/full/${category}/${photoName}`;
}

function getThumbSizeKey(category, photoName) {
  return `content/thumb/${category}/${photoName}`;
}

function getPhotoUri(photoKey) {
  return BASE_URI + photoKey;
}
