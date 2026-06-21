/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem } from "./types";

export const initialServices: ServiceItem[] = [
  {
    id: "serv-1",
    name: "Beersheba City Smart Transit API",
    category: "Infrastructure",
    status: "operational",
    load: 14,
  },
  {
    id: "serv-2",
    name: "Negev Innovation District Portal",
    category: "Business & Innovation",
    status: "operational",
    load: 32,
  },
  {
    id: "serv-3",
    name: "BGU Research Collaboration Network",
    category: "Education & Tech",
    status: "operational",
    load: 57,
  },
  {
    id: "serv-4",
    name: "Municipal Water & Resource Node",
    category: "Utility",
    status: "operational",
    load: 8,
  },
  {
    id: "serv-5",
    name: "Community Cultural Events Calendar",
    category: "Social & Tourism",
    status: "maintenance",
    load: 3,
  },
  {
    id: "serv-6",
    name: "Beersheba Cyber Center Core Security",
    category: "Cyberspace / IT",
    status: "operational",
    load: 88,
  },
];

export const codebaseGuides = [
  {
    title: "Upload via Drag & Drop",
    description: "Drag the Beersheba zip file directly onto the upload zone. The system will process and make files available.",
    steps: ["Select your beersheba.zip", "Drag it to the Codebase tab", "Wait for extraction and analysis"],
  },
  {
    title: "Manual File Creation",
    description: "If you want to paste individual files directly into the editor, click on the file explorer to create folders and modules.",
    steps: ["Create folders under /src/components", "Paste file contents for custom views", "Import and bind them into App.tsx"],
  },
  {
    title: "Local Git Synchronization",
    description: "You may push the repository to GitHub or coordinate local files by using standard file explorer mechanics.",
    steps: ["Export this AI Studio workspace as a ZIP", "Merge with local Beersheba assets", "Upload updated archive"],
  },
];
