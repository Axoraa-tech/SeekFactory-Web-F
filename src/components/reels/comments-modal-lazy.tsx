"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const CommentsModal = dynamic(
  () =>
    import("@/components/reels/comments-modal").then((m) => ({
      default: m.CommentsModal,
    })),
  { ssr: false }
);

type Props = ComponentProps<typeof CommentsModal>;

/** Lazy comments drawer — keeps heavy modal code out of initial reel bundles. */
export function CommentsModalLazy(props: Props) {
  if (!props.isOpen) return null;
  return <CommentsModal {...props} />;
}
