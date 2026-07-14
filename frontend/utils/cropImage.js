const OUTPUT_SIZE = 1024;
const JPEG_QUALITY = 0.95;

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.crossOrigin = "anonymous";
    image.src = url;
  });

export const getCroppedImage = async (imageSrc, cropArea) => {
  if (!imageSrc || !cropArea) {
    throw new Error("Image and crop area are required");
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image crop failed");
  }

  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Cropped image could not be created"));
          return;
        }

        const file = new File(
          [blob],
          `profile-${Date.now()}.jpg`,
          { type: "image/jpeg" }
        );

        resolve({
          file,
          preview: URL.createObjectURL(blob),
        });
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
};