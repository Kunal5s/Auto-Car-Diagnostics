import { Cog, Signal, AlertTriangle, AppWindow, Wrench, Fuel, BatteryCharging, TrendingUp } from "lucide-react";
import { Obd2Icon } from "@/components/icons/obd2-icon";
import type { Category } from "./types";

export const categories: Category[] = [
  { name: 'Engine', icon: Cog },
  { name: 'Sensors', icon: Signal },
  { name: 'OBD2', icon: Obd2Icon },
  { name: 'Alerts', icon: AlertTriangle },
  { name: 'Apps', icon: AppWindow },
  { name: 'Maintenance', icon: Wrench },
  { name: 'Fuel', icon: Fuel },
  { name: 'EVs', icon: BatteryCharging },
  { name: 'Trends', icon: TrendingUp },
];
