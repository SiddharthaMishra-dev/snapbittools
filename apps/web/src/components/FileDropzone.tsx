import { IconCloudUpload, IconLock } from "@tabler/icons-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  title: string;
  description: string;
  buttonLabel: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  privacyNote?: string;
  onFiles: (files: FileList) => void | Promise<void>;
  className?: string;
};

const DEFAULT_PRIVACY = "Processed in your browser. Nothing is uploaded to a server.";

export function FileDropzone({
  title,
  description,
  buttonLabel,
  accept,
  multiple = false,
  disabled = false,
  privacyNote = DEFAULT_PRIVACY,
  onFiles,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={(e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "border-3 border-dashed rounded-lg p-12 text-center transition-all duration-300",
        isDragging ? "border-brand-primary bg-brand-primary/20" : "border-theme-border hover:border-brand-primary/40",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <IconCloudUpload className={cn("h-14 w-14 mx-auto mb-4 transition-colors", isDragging ? "text-brand-primary" : "text-theme-muted")} />
      <h2 className="text-2xl font-bold text-theme-heading mb-2">{title}</h2>
      <p className="text-theme-body mb-5">{description}</p>
      <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} className={cn(tc.btnPrimary, "px-6 py-3")}>
        {buttonLabel}
      </button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-theme-muted">
        <IconLock className="w-3.5 h-3.5" />
        {privacyNote}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
      />
    </div>
  );
}
