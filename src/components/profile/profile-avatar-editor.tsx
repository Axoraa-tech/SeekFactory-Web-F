"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { getApi } from "@/shared/api";
import { useTranslations } from "next-intl";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

type Props = {
  avatarUrl: string;
  name: string;
  size?: number;
  className?: string;
};

/** Profile photo with a camera button: uploads a new image and saves it as the buyer's avatar. */
export function ProfileAvatarEditor({ avatarUrl, name, size = 104, className }: Props) {
  const t = useTranslations();
  const toast = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("profile.avatar.notAnImage"));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error(t("profile.avatar.tooLarge"));
      return;
    }
    setUploading(true);
    try {
      const api = getApi();
      const uploaded = await api.media.upload(file, "image");
      await api.session.updateProfile({ avatarUrl: uploaded.url });
      setSrc(uploaded.url);
      toast.success(t("profile.avatar.updated"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : t("profile.avatar.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <Avatar src={src} alt={name} size={size} className={className} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={t("profile.avatar.change")}
        title={t("profile.avatar.change")}
        className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white shadow-md ring-2 ring-white transition-colors hover:bg-brand-blue-dark disabled:opacity-70"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
