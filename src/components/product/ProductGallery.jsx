import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { IconButton, Modal } from "@/components/ui/index.js";
import { imageUrl } from "@/lib/images.js";
import { cn } from "@/lib/cn.js";
import { scrollBehavior } from "./motion.js";

const ZOOM_SCALE = 2.2;

function ZoomStage({ src, alt }) {
  const [zoom, setZoom] = useState({ active: false, origin: "50% 50%" });
  const toggle = (event) => {
    if (zoom.active) return setZoom({ active: false, origin: zoom.origin });
    const rect = event.currentTarget.getBoundingClientRect();
    const isKeyboard = event.detail === 0;
    const x = isKeyboard ? 50 : ((event.clientX - rect.left) / rect.width) * 100;
    const y = isKeyboard ? 50 : ((event.clientY - rect.top) / rect.height) * 100;
    return setZoom({ active: true, origin: `${x}% ${y}%` });
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={zoom.active ? "Zoom out" : "Zoom in"}
      className={cn("focus-ring block aspect-[4/3] w-full overflow-hidden rounded-xl bg-cream-200", zoom.active ? "cursor-zoom-out" : "cursor-zoom-in")}
    >
      <img
        src={src}
        alt={alt}
        width="800"
        height="600"
        draggable="false"
        className="h-full w-full object-contain transition-transform duration-250"
        style={{ transform: zoom.active ? `scale(${ZOOM_SCALE})` : "scale(1)", transformOrigin: zoom.origin }}
      />
    </button>
  );
}

function ZoomViewer({ open, onClose, images, name, index, onChange }) {
  const count = images.length;
  const step = (delta) => onChange((index + delta + count) % count);
  const handleKeys = (event) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };
  return (
    <Modal open={open} onClose={onClose} title={`${name} - photo ${index + 1} of ${count}`} className="!max-w-4xl">
      <div className="flex flex-col gap-3" onKeyDown={handleKeys}>
        <ZoomStage key={index} src={imageUrl(images[index])} alt={`${name}, photo ${index + 1}`} />
        {count > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <IconButton label="Previous photo" variant="secondary" onClick={() => step(-1)}>
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </IconButton>
            <IconButton label="Next photo" variant="secondary" onClick={() => step(1)}>
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </IconButton>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function Thumbnails({ images, index, onSelect }) {
  return (
    <ul className="hidden gap-2 md:flex lg:flex-col" aria-label="Photos">
      {images.map((ref, position) => (
        <li key={`${ref}-${position}`}>
          <button
            type="button"
            onClick={() => onSelect(position)}
            aria-label={`Show photo ${position + 1} of ${images.length}`}
            aria-current={position === index ? "true" : undefined}
            className={cn(
              "focus-ring h-[60px] w-20 overflow-hidden rounded-lg border bg-cream-200",
              position === index ? "border-ink-900 ring-1 ring-ink-900" : "border-ink-200 hover:border-ink-300",
            )}
          >
            <img src={imageUrl(ref)} alt="" width="80" height="60" loading="lazy" className="h-full w-full object-contain" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Dots({ count, index, onSelect }) {
  if (count < 2) return null;
  return (
    <div className="flex justify-center md:hidden">
      {Array.from({ length: count }, (_, position) => (
        <button
          key={position}
          type="button"
          onClick={() => onSelect(position)}
          aria-label={`Go to photo ${position + 1}`}
          aria-current={position === index ? "true" : undefined}
          className="focus-ring grid h-11 w-8 place-items-center"
        >
          <span className={cn("block h-2.5 rounded-full transition-all duration-150", position === index ? "w-6 bg-ink-900" : "w-2.5 bg-ink-300")} />
        </button>
      ))}
    </div>
  );
}

export function ProductGallery({ images, name }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const showPhoto = (position) => {
    const track = trackRef.current;
    setIndex(position);
    track?.scrollTo({ left: position * track.clientWidth, behavior: scrollBehavior() });
  };

  const syncFromScroll = () => {
    const track = trackRef.current;
    if (track && track.clientWidth > 0) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <div className="flex flex-col gap-2 lg:flex-row-reverse lg:gap-4">
      <div className="min-w-0 flex-1">
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={syncFromScroll}
            role="group"
            aria-roledescription="carousel"
            aria-label={`${name} photos`}
            className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-xl border border-ink-200 bg-cream-200"
          >
            {images.map((ref, position) => (
              <div key={`${ref}-${position}`} className="w-full shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${images.length}`}>
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label={`Zoom photo ${position + 1} of ${images.length}`}
                  className="focus-ring block aspect-[4/3] w-full cursor-zoom-in"
                >
                  <img
                    src={imageUrl(ref)}
                    alt={position === 0 ? name : `${name}, photo ${position + 1}`}
                    width="800"
                    height="600"
                    loading={position === 0 ? "eager" : "lazy"}
                    fetchpriority={position === 0 ? "high" : undefined}
                    className="h-full w-full object-contain"
                  />
                </button>
              </div>
            ))}
          </div>
          <span className="pointer-events-none absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-ink-800 shadow-sh-1" aria-hidden="true">
            <ZoomIn className="h-5 w-5" />
          </span>
        </div>
        <Dots count={images.length} index={index} onSelect={showPhoto} />
      </div>
      {images.length > 1 ? <Thumbnails images={images} index={index} onSelect={showPhoto} /> : null}
      <ZoomViewer open={zoomOpen} onClose={() => setZoomOpen(false)} images={images} name={name} index={index} onChange={showPhoto} />
    </div>
  );
}
