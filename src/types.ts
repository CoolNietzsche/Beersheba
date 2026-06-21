/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActiveTab {
  Dashboard = "dashboard",
  Uploader = "uploader",
  Documentation = "documentation",
  Services = "services",
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: string;
  color: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  status: "operational" | "maintenance" | "down";
  load: number;
}
