const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
// Största fil användaren får välja. Exponeras så att formuläret kan visa gränsen
// och använda samma siffra i felmeddelandet.
export const MAX_INSPIRATION_IMAGE_MB = 10;
const maxSourceFileBytes = MAX_INSPIRATION_IMAGE_MB * 1024 * 1024;
const maxOutputFileBytes = 3.5 * 1024 * 1024;
const maxDimension = 1600;
const outputQuality = 0.82;

function sanitizeFileName(value) {
  const normalized = String(value || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${normalized || "inspiration"}.jpg`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Bilden kunde inte läsas. Välj en annan fil."));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Bilden kunde inte förberedas för uppladdning."));
    reader.readAsDataURL(blob);
  });
}

export async function prepareLeadImageUpload(file) {
  if (!file) {
    return null;
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error(
      "Filformatet stöds inte. Ladda upp en bild i JPG-, PNG- eller WEBP-format."
    );
  }

  if (file.size > maxSourceFileBytes) {
    const fileMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Bilden är för stor (${fileMb} MB). Välj en fil på högst ${MAX_INSPIRATION_IMAGE_MB} MB.`
    );
  }

  const image = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Det gick inte att förbereda bilden för uppladdning.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/jpeg", outputQuality);

  if (!blob) {
    throw new Error("Det gick inte att komprimera bilden. Försök igen med en annan fil.");
  }

  if (blob.size > maxOutputFileBytes) {
    throw new Error(
      "Bilden är för detaljrik för att komprimeras tillräckligt. Prova en mindre bild eller en lägre upplösning."
    );
  }

  const dataUrl = await blobToDataUrl(blob);

  return {
    previewUrl: dataUrl,
    fileName: sanitizeFileName(file.name),
    contentType: "image/jpeg",
    dataUrl
  };
}
