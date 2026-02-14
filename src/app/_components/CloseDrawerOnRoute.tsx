"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function CloseDrawerOnRoute({ drawerId }: { drawerId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.getElementById(drawerId) as HTMLInputElement | null;
    if (el) el.checked = false;
  }, [pathname, drawerId]);

  return null;
}