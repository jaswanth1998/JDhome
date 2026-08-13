import type { Metadata } from "next";
import SettingsContent from "./SettingsContent";

export const metadata: Metadata = {
  title: "Document Settings | JD Home Admin",
};

export default function SettingsPage() {
  return <SettingsContent />;
}
