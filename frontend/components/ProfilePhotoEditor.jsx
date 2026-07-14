"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import {
  FiCamera,
  FiCheck,
  FiCrop,
  FiX,
} from "react-icons/fi";
import { getCroppedImage } from "@/utils/cropImage";
import { showErrorToast } from "@/utils/toast";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function ProfilePhotoEditor({
  currentImage = "",
  username = "",
  onImageChange,
}) {
  const fileInputRef = useRef(null);
  const originalUrlRef = useRef("");
  const croppedUrlRef = useRef("");

  const [avatarPreview, setAvatarPreview] = useState(currentImage);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [editorPreview, setEditorPreview] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [cropMode, setCropMode] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setAvatarPreview(currentImage || "");
  }, [currentImage]);

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

  const getInitials = (name) =>
    (name || "U")
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

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

    if (file.size > MAX_IMAGE_SIZE) {
      showErrorToast("Image size must be less than 10MB");
      return;
    }

    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }

    if (croppedUrlRef.current) {
      URL.revokeObjectURL(croppedUrlRef.current);
      croppedUrlRef.current = "";
    }

    const imageUrl = URL.createObjectURL(file);

    originalUrlRef.current = imageUrl;

    setSelectedFile(file);
    setSelectedImage(imageUrl);
    setEditorPreview(imageUrl);

    setCrop({ x: 0, y: 0 });
    setZoom(1.2);
    setCroppedAreaPixels(null);
    setCropMode(false);

    // Preview modal opens first.
    // Main avatar does not change here.
    setEditorOpen(true);
  };

  // ==========================
  // Crop Controls
  // ==========================

  const handleCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const openCropMode = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1.2);
    setCroppedAreaPixels(null);
    setCropMode(true);
  };

  const applyCrop = async () => {
    if (!selectedImage || !croppedAreaPixels) {
      showErrorToast("Please adjust the image first");
      return;
    }

    try {
      setProcessing(true);

      const croppedImage = await getCroppedImage(
        selectedImage,
        croppedAreaPixels
      );

      if (croppedUrlRef.current) {
        URL.revokeObjectURL(croppedUrlRef.current);
      }

      croppedUrlRef.current = croppedImage.preview;

      setSelectedFile(croppedImage.file);
      setEditorPreview(croppedImage.preview);
      setCropMode(false);
    } catch (error) {
      showErrorToast(
        error?.message || "Failed to crop profile image"
      );
    } finally {
      setProcessing(false);
    }
  };

  // ==========================
  // Save / Close Editor
  // ==========================

  const savePhoto = () => {
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
    });
  };

  const closeEditor = () => {
    if (processing) return;

    setEditorOpen(false);
    setCropMode(false);
    setSelectedFile(null);
    setSelectedImage("");
    setEditorPreview("");
    setCroppedAreaPixels(null);
  };

  return (
    <>
      {/* Main Profile Avatar */}
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#D4AF37] bg-[#D4AF37]/15 text-2xl font-bold text-[#D4AF37] shadow-[0_0_0_5px_rgba(212,175,55,0.08)]">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={`${username || "User"} profile`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              getInitials(username)
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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

      {/* Preview / Crop Editor */}
      {editorOpen && selectedImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700 bg-[#0d1117] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Edit Profile Photo
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Preview your photo and crop it if needed.
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

            {/* Preview Mode */}
            {!cropMode && (
              <div className="flex min-h-[430px] items-center justify-center bg-black px-6 py-8">
                <div className="relative">
                  <div className="flex h-[330px] w-[330px] max-w-[75vw] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#D4AF37] bg-black">
                    <img
                      src={editorPreview}
                      alt="Selected profile preview"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>

                  {/* Crop icon appears on preview avatar */}
                  <button
                    type="button"
                    onClick={openCropMode}
                    title="Crop and adjust photo"
                    aria-label="Crop selected photo"
                    className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#102A43] text-[#D4AF37] shadow-xl transition hover:bg-[#D4AF37] hover:text-black"
                  >
                    <FiCrop size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Crop Mode */}
            {cropMode && (
              <div className="relative h-[460px] w-full cursor-grab overflow-hidden bg-black active:cursor-grabbing">
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  objectFit="cover"
                  showGrid={false}
                  restrictPosition={false}
                  minZoom={0.7}
                  maxZoom={5}
                  zoomSpeed={0.12}
                  zoomWithScroll
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  style={{
                    containerStyle: {
                      width: "100%",
                      height: "100%",
                      touchAction: "none",
                      cursor: "grab",
                    },
                    mediaStyle: {
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      WebkitUserDrag: "none",
                      touchAction: "none",
                    },
                    cropAreaStyle: {
                      pointerEvents: "none",
                      border: "3px solid #D4AF37",
                      boxShadow:
                        "0 0 0 9999px rgba(0,0,0,0.68)",
                    },
                  }}
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-6 py-4">
              <button
                type="button"
                onClick={
                  cropMode
                    ? () => setCropMode(false)
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
                  {processing ? "Applying..." : "Apply Crop"}
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
    </>
  );
}