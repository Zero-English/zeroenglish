"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface IphoneProps extends ComponentProps<"div"> {
  /**
   * What the screenshot or video shows, read by screen readers. Leave it
   * empty when the picture is decoration.
   *
   * @default ""
   */
  alt?: string;
  /** An image that fills the screen, cropped to it from the centre. */
  src?: string;
  /**
   * A video that fills the screen, muted and looping. It plays on its own
   * while it's on screen, with a button to pause it, except under reduced
   * motion, where it waits with its controls showing.
   */
  videoSrc?: string;
}

/**
 * An iPhone drawn around a screen: a flat-edged body with deep rounded
 * corners, the Dynamic Island over the top of the screen, the action and
 * volume buttons on the left edge and the side button on the right. The
 * screen is a real box, so an image, a video or any children fill it and
 * are clipped to its corners, under the island, the children above the
 * image and the video; the body is an SVG that scales with the width, in
 * the theme's neutral tokens. Size it by width (`w-64`); the height follows.
 */
export const Iphone = (props: IphoneProps) => {
  const { alt = "", children, className, src, videoSrc, ...rest } = props;
  const video = useRef<HTMLVideoElement>(null);
  /** The visitor paused it, so coming back into view doesn't restart it. */
  const held = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = video.current;
    if (!(node && videoSrc)) {
      return;
    }
    // Inline in both cases: without it, Safari on an iPhone plays the video
    // full screen.
    node.playsInline = true;
    // Played from here, not by `autoplay`: under reduced motion it waits
    // with its controls showing, over `src` when there is one.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.controls = true;
      return;
    }
    node.muted = true;
    // Only while it's on screen, so that `preload="none"` holds: a phone
    // further down the page downloads nothing until it's scrolled to.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        node.pause();
      } else if (!held.current) {
        // A refused autoplay leaves it paused, with the play button showing.
        node.play().catch(() => setPaused(node.paused));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [videoSrc]);

  const toggleVideo = () => {
    const node = video.current;
    if (!node) {
      return;
    }
    held.current = !node.paused;
    if (node.paused) {
      node.play().catch(() => undefined);
    } else {
      node.pause();
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-[434/882] w-full max-w-[434px]",
        className
      )}
      data-slot="iphone"
      {...rest}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full"
        data-slot="iphone-frame"
        fill="none"
        viewBox="0 0 434 882"
      >
        <path
          className="fill-border"
          d="M3 170H2a1.5 1.5 0 0 0-1.5 1.5v31A1.5 1.5 0 0 0 2 204h1Z"
        />
        <path
          className="fill-border"
          d="M3 234H2a1.5 1.5 0 0 0-1.5 1.5v61A1.5 1.5 0 0 0 2 298h1Z"
        />
        <path
          className="fill-border"
          d="M3 316H2a1.5 1.5 0 0 0-1.5 1.5v61A1.5 1.5 0 0 0 2 380h1Z"
        />
        <path
          className="fill-border"
          d="M431 280h1a1.5 1.5 0 0 1 1.5 1.5v101a1.5 1.5 0 0 1-1.5 1.5h-1Z"
        />
        <rect className="fill-border" height="882" rx="72" width="428" x="3" />
        <rect
          className="fill-card"
          height="875"
          rx="68.5"
          width="421"
          x="6.5"
          y="3.5"
        />
        <rect
          className="fill-border"
          height="3"
          rx="1.5"
          width="80"
          x="177"
          y="8"
        />
      </svg>
      <div
        className="absolute inset-x-[4.9539%] inset-y-[2.2109%] isolate overflow-hidden rounded-[14.0665%/6.5243%] bg-muted"
        data-slot="iphone-screen"
      >
        {/* The image and the video sit below the screen's own layer, so
            children paint over them whether or not they are positioned. */}
        {src ? (
          <img
            alt={videoSrc ? "" : alt}
            className="absolute inset-0 -z-10 size-full object-cover"
            height={843}
            src={src}
            width={391}
          />
        ) : null}
        {videoSrc ? (
          <video
            aria-label={alt || undefined}
            className="absolute inset-0 -z-10 size-full object-cover"
            loop
            muted
            onPause={() => setPaused(true)}
            onPlay={() => setPaused(false)}
            preload="none"
            ref={video}
            src={videoSrc}
          />
        ) : null}
        {children}
        {videoSrc ? (
          <button
            aria-label={paused ? "Play video" : "Pause video"}
            className={cn(
              "absolute end-4 bottom-4 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-xs outline-none backdrop-blur-sm transition-opacity motion-reduce:hidden",
              "in-[[data-slot=iphone-screen]:hover]:opacity-100 opacity-0 pointer-coarse:opacity-100 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-paused:opacity-100"
            )}
            data-paused={paused ? "" : undefined}
            data-slot="iphone-video-toggle"
            onClick={toggleVideo}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {paused ? (
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              ) : (
                <path d="M6 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm9 0h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
              )}
            </svg>
          </button>
        ) : null}
      </div>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
        data-slot="iphone-island"
        fill="none"
        viewBox="0 0 434 882"
      >
        <rect
          className="fill-foreground dark:fill-background"
          height="36"
          rx="18"
          width="124"
          x="155"
          y="31"
        />
        <circle className="fill-muted-foreground/30" cx="260" cy="49" r="6" />
      </svg>
    </div>
  );
};
