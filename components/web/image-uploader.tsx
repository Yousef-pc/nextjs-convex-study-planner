"use client";

import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface Point { x: number; y: number; }
interface Area { x: number; y: number; width: number; height: number; }

interface ImageUploaderProps {
  children: React.ReactNode;
  aspectRatio?: number;
  maxSize?: number;
  acceptedFileTypes?: string[];
  onImageCropped?: (blob: Blob) => void;
}

export function ImageUploader({
  children,
  aspectRatio = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
  onImageCropped,
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!acceptedFileTypes.includes(file.type)) return alert("Invalid file type");
    if (file.size > maxSize) return alert("File too large");

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again if needed
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cropImage = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = image;
    await new Promise((resolve) => { img.onload = resolve; });

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        img,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0, 0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          if (onImageCropped) onImageCropped(blob);
          setIsCropDialogOpen(false);
        }
      }, "image/jpeg");
    }
  }, [image, croppedAreaPixels, onImageCropped]);

  return (
    <>
      {/* We click the hidden input when the children are clicked */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={acceptedFileTypes.join(",")}
        onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
      />
      
      <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {image && (
            <>
              <div className="relative w-full h-80">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="flex items-center gap-4">
                <ZoomOut className="h-4 w-4" />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => {
                    const newZoom = Array.isArray(value) ? value[0] : value;
                    setZoom(newZoom);
                  }}
                />
                <ZoomIn className="h-4 w-4" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={cropImage}>Apply</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}