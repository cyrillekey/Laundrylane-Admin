"use client";

import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { XIcon, ImageIcon } from "lucide-react";
import Image from "next/image";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function CloudinaryUpload({ value, onChange, className }: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", CLOUD_NAME);
      formData.append("template", "png_transform");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      onChange(data.secure_url);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className={`relative size-24 rounded-lg overflow-hidden border ${className ?? ""}`}>
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 size-5 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
          >
            <XIcon className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex size-24 items-center justify-center rounded-lg border border-dashed hover:bg-accent transition-colors disabled:opacity-50 ${className ?? ""}`}
        >
          {uploading ? (
            <Spinner className="size-5" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
