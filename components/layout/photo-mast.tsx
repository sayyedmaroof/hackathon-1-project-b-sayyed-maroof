import Image from "next/image";
import { cn } from "@/lib/utils";
import { photos, type PhotoId } from "@/lib/photos";

type PhotoMastProps = {
  id: PhotoId;
  className?: string;
};

/** A short photographic header. The alt text stays with the image. */
export function PhotoMast({ id, className }: PhotoMastProps) {
  const photo = photos[id];
  return (
    <div className={cn("rise-in relative mb-8 h-44 overflow-hidden rounded-[28px] md:h-56", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 960px"
        className="photo-zoom object-cover"
        priority
      />
    </div>
  );
}
