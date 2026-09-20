"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const InteractiveChatApp = dynamic(
  () =>
    import("@/components/messages/interactive-chat-app").then((m) => ({
      default: m.InteractiveChatApp,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-140px)] min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
        Loading messages…
      </div>
    ),
  }
);

type Props = ComponentProps<typeof InteractiveChatApp>;

export function InteractiveChatAppLazy(props: Props) {
  return <InteractiveChatApp {...props} />;
}
