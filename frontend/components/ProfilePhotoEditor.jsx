"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  FiCamera,
  FiCheck,
  FiCrop,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { showErrorToast } from "@/utils/toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const OUTPUT_SIZE = 1024;
const CROP_ASPECT = 1;

export default function ProfilePhotoEditor({
  currentImage = "",
  username = "",
  onImageChange,
}) {
  const fileInputRef = useRef(null);
  const cropImageRef = useRef(null);

  const originalUrlRef = useRef("");
  const croppedUrlRef = useRef("");

  const [avatarPreview, setAvatarPreview] = useState(
    currentImage
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [editorPreview, setEditorPreview] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [removeRequested, setRemoveRequested] =
    useState(false);

  const [crop, setCrop] = useState(undefined);
  const [completedCrop, setCompletedCrop] =
    useState(null);

  const [processing, setProcessing] = useState(false);

  // ==========================
  // Sync Existing Image
  // ==========================

  useEffect(() => {
    setAvatarPreview(currentImage || "");
  }, [currentImage]);

  // ==========================
  // Cleanup Temporary URLs
  // ==========================

  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }

      if (croppedUrlRef.current) {
        URL.revokeObjectURL(croppedUrlRef.current);
      }
    };
  }, []);

  // ==========================
  // Helpers
  // ==========================

  const getInitials = (name) =>
    (name || "U")
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const resetCropState = () => {
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const revokeTemporaryUrls = () => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = "";
    }

    if (croppedUrlRef.current) {
      URL.revokeObjectURL(croppedUrlRef.current);
      croppedUrlRef.current = "";
    }
  };

  // ==========================
  // Select Image
  // ==========================

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showErrorToast("Image size must be less than 10MB");
      return;
    }

    revokeTemporaryUrls();

    const imageUrl = URL.createObjectURL(file);

    originalUrlRef.current = imageUrl;

    setSelectedFile(file);
    setSelectedImage(imageUrl);
    setEditorPreview(imageUrl);

    setRemoveRequested(false);
    setCropMode(false);
    resetCropState();

    // Main profile avatar abhi change nahi hoga.
    // Pehle preview modal open hoga.
    setEditorOpen(true);
  };

  // ==========================
  // Initialize Circle Crop
  // ==========================

  const handleCropImageLoad = (event) => {
    const image = event.currentTarget;

    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 70,
        },
        CROP_ASPECT,
        image.width,
        image.height
      ),
      image.width,
      image.height
    );

    setCrop(initialCrop);
  };

  // ==========================
  // Open / Close Crop Mode
  // ==========================

  const openCropMode = () => {
    if (!selectedImage) {
      showErrorToast("Please select an image first");
      return;
    }

    resetCropState();
    setCropMode(true);
  };

  const closeCropMode = () => {
    if (processing) return;

    setCropMode(false);
    resetCropState();
  };

  // ==========================
  // Create Circle Image
  // ==========================

  const createCroppedImage = async () => {
    const image = cropImageRef.current;

    if (
      !image ||
      !completedCrop?.width ||
      !completedCrop?.height
    ) {
      throw new Error("Please select a crop area");
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image crop failed");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth =
      completedCrop.width * scaleX;
    const sourceHeight =
      completedCrop.height * scaleY;

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    context.clearRect(
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    // Force circular final image.
    context.save();
    context.beginPath();
    context.arc(
      OUTPUT_SIZE / 2,
      OUTPUT_SIZE / 2,
      OUTPUT_SIZE / 2,
      0,
      Math.PI * 2
    );
    context.closePath();
    context.clip();

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    context.restore();

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Cropped image could not be created"
              )
            );
            return;
          }

          const file = new File(
            [blob],
            `profile-${Date.now()}.png`,
            {
              type: "image/png",
            }
          );

          resolve({
            file,
            preview: URL.createObjectURL(blob),
          });
        },
        "image/png",
        1
      );
    });
  };

  // ==========================
  // Apply Crop
  // ==========================

  const applyCrop = async () => {
    if (
      !completedCrop?.width ||
      !completedCrop?.height
    ) {
      showErrorToast(
        "Please adjust the circular crop area"
      );
      return;
    }

    try {
      setProcessing(true);

      const croppedImage =
        await createCroppedImage();

      if (croppedUrlRef.current) {
        URL.revokeObjectURL(
          croppedUrlRef.current
        );
      }

      croppedUrlRef.current =
        croppedImage.preview;

      setSelectedFile(croppedImage.file);
      setEditorPreview(croppedImage.preview);
      setRemoveRequested(false);
      setCropMode(false);

      resetCropState();
    } catch (error) {
      showErrorToast(
        error?.message ||
          "Failed to crop profile image"
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================
  // Remove Photo
  // ==========================

  const removePhoto = () => {
    setSelectedFile(null);
    setSelectedImage("");
    setEditorPreview("");
    setRemoveRequested(true);
    setCropMode(false);

    resetCropState();
  };

  // ==========================
  // Save Photo
  // ==========================

  const savePhoto = () => {
    if (removeRequested) {
      setAvatarPreview("");
      setEditorOpen(false);

      onImageChange?.({
        file: null,
        preview: "",
        remove: true,
      });

      return;
    }

    if (!selectedFile || !editorPreview) {
      showErrorToast("Please select an image");
      return;
    }

    setAvatarPreview(editorPreview);
    setEditorOpen(false);
    setCropMode(false);

    onImageChange?.({
      file: selectedFile,
      preview: editorPreview,
      remove: false,
    });
  };

  // ==========================
  // Close Editor
  // ==========================

  const closeEditor = () => {
    if (processing) return;

    setEditorOpen(false);
    setCropMode(false);
    setSelectedFile(null);
    setSelectedImage("");
    setEditorPreview("");
    setRemoveRequested(false);

    resetCropState();
  };

  return (
    <>
      {/* Main Profile Avatar */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div
            className="flex items-center justify-center overflow-hidden border-[3px] border-[#D4AF37] bg-[#D4AF37]/15 text-2xl font-bold text-[#D4AF37] shadow-[0_0_0_5px_rgba(212,175,55,0.08)]"
            style={{
              width: "112px",
              height: "112px",
              minWidth: "112px",
              minHeight: "112px",
              borderRadius: "9999px",
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={`${username || "User"} profile`}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  borderRadius: "9999px",
                  objectFit: "cover",
                }}
              />
            ) : (
              getInitials(username)
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            title="Choose profile photo"
            aria-label="Choose profile photo"
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0d1117] text-white shadow-xl transition hover:bg-[#D4AF37] hover:text-black"
          >
            <FiCamera size={17} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Photo Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1117] shadow-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-700 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Edit Profile Photo
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Preview, crop or remove your
                  profile photo.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={processing}
                aria-label="Close photo editor"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Circle Preview */}
            {!cropMode && (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-black px-6 py-8">
                {editorPreview ? (
                  <>
                    <div
                      className="flex items-center justify-center overflow-hidden border-[3px] border-[#D4AF37] bg-black shadow-[0_0_0_6px_rgba(212,175,55,0.08)]"
                      style={{
                        width: "320px",
                        height: "320px",
                        maxWidth: "72vw",
                        maxHeight: "72vw",
                        aspectRatio: "1 / 1",
                        borderRadius: "9999px",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={editorPreview}
                        alt="Selected profile preview"
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "block",
                          objectFit: "cover",
                          borderRadius: "9999px",
                        }}
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={openCropMode}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37] bg-[#D4AF37]/10 px-5 py-2.5 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
                      >
                        <FiCrop size={17} />
                        Crop Photo
                      </button>

                      <button
                        type="button"
                        onClick={removePhoto}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
                      >
                        <FiTrash2 size={17} />
                        Remove Photo
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div
                      className="mx-auto flex items-center justify-center border-[3px] border-[#D4AF37] bg-[#D4AF37]/15 text-4xl font-bold text-[#D4AF37]"
                      style={{
                        width: "176px",
                        height: "176px",
                        minWidth: "176px",
                        minHeight: "176px",
                        borderRadius: "9999px",
                      }}
                    >
                      {getInitials(username)}
                    </div>

                    <p className="mt-5 text-sm text-gray-400">
                      Your profile photo will be
                      removed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Circular Crop Mode */}
            {cropMode && selectedImage && (
              <div className="min-h-0 flex-1 overflow-auto bg-black p-5">
                <div className="flex min-h-full items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(
                      _pixelCrop,
                      percentCrop
                    ) => {
                      setCrop({
                        ...percentCrop,
                        width:
                          percentCrop.width,
                        height:
                          percentCrop.width,
                      });
                    }}
                    onComplete={(pixelCrop) => {
                      setCompletedCrop({
                        ...pixelCrop,
                        height: pixelCrop.width,
                      });
                    }}
                    aspect={1}
                    circularCrop={true}
                    ruleOfThirds={true}
                    keepSelection={true}
                    minWidth={80}
                    minHeight={80}
                    className="profile-circle-crop"
                  >
                    <img
                      ref={cropImageRef}
                      src={selectedImage}
                      alt="Crop profile photo"
                      onLoad={handleCropImageLoad}
                      draggable={false}
                      className="block max-h-[58vh] max-w-full select-none object-contain"
                    />
                  </ReactCrop>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                  Move the circular area and resize
                  it using the handles.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
              <button
                type="button"
                onClick={
                  cropMode
                    ? closeCropMode
                    : closeEditor
                }
                disabled={processing}
                className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                {cropMode ? "Back" : "Cancel"}
              </button>

              {cropMode ? (
                <button
                  type="button"
                  onClick={applyCrop}
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiCrop size={17} />

                  {processing
                    ? "Applying..."
                    : "Apply Crop"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={savePhoto}
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiCheck size={17} />
                  Save Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Force React Image Crop Circle Styling */}
      <style jsx global>{`
        .profile-circle-crop {
          max-width: 100%;
        }

        .profile-circle-crop
          .ReactCrop__crop-selection {
          border-radius: 50% !important;
          border: 3px solid #d4af37 !important;
          box-shadow:
            0 0 0 9999px rgba(0, 0, 0, 0.67),
            0 0 0 2px rgba(212, 175, 55, 0.2) !important;
        }

        .profile-circle-crop
          .ReactCrop__drag-handle {
          width: 14px !important;
          height: 14px !important;
          border: 2px solid #111827 !important;
          border-radius: 50% !important;
          background: #d4af37 !important;
        }

        .profile-circle-crop
          .ReactCrop__rule-of-thirds-vt::before,
        .profile-circle-crop
          .ReactCrop__rule-of-thirds-vt::after,
        .profile-circle-crop
          .ReactCrop__rule-of-thirds-hz::before,
        .profile-circle-crop
          .ReactCrop__rule-of-thirds-hz::after {
          background-color: rgba(
            255,
            255,
            255,
            0.55
          ) !important;
        }
      `}</style>
    </>
  );
}