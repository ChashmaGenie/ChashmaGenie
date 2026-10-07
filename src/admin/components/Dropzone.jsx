import { useRef, useState } from "react";
import { Camera, Images, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { cn } from "@/lib/cn.js";

const ACCEPT = "image/*";

export function Dropzone({ onFiles, disabled = false, remaining }) {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const deliver = (fileList) => {
    if (fileList?.length) onFiles(fileList);
  };

  const handleInput = (event) => {
    deliver(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) deliver(event.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-6 text-center",
        dragging ? "border-sky-700 bg-ink-100" : "border-ink-300 bg-cream-100",
      )}
    >
      <UploadCloud className="h-10 w-10 text-ink-600" aria-hidden="true" />
      <div>
        <p className="text-lg font-semibold">Add photos of this item</p>
        <p className="text-sm text-ink-600">You can add {remaining} more. They are shrunk automatically so the shop stays fast.</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button onClick={() => cameraRef.current?.click()} disabled={disabled} size="lg" className="w-full whitespace-nowrap sm:w-auto">
          <Camera className="h-5 w-5 shrink-0" aria-hidden="true" />
          Take photo
        </Button>
        <Button variant="secondary" onClick={() => galleryRef.current?.click()} disabled={disabled} size="lg" className="w-full whitespace-nowrap sm:w-auto">
          <Images className="h-5 w-5 shrink-0" aria-hidden="true" />
          Choose from gallery
        </Button>
      </div>
      <input ref={cameraRef} type="file" accept={ACCEPT} capture="environment" className="hidden" onChange={handleInput} tabIndex={-1} aria-hidden="true" />
      <input ref={galleryRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={handleInput} tabIndex={-1} aria-hidden="true" />
    </div>
  );
}
