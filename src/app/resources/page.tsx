export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import ResourcesClient from "./ResourcesClient";

export const metadata: Metadata = { title: "All files" };

export default function ResourcesPage() {
  return <ResourcesClient />;
}