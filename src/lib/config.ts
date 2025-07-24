
import { Cog, Signal, AlertTriangle, AppWindow, Wrench, Fuel, BatteryCharging, TrendingUp, ScanLine, Battery, Thermometer, GaugeCircle, Gauge, Filter, AudioWaveform, Replace, AirVent, ShieldAlert, Wind, Camera, Home } from "lucide-react";
import { Obd2Icon } from "@/components/icons/obd2-icon";
import type { Category, Tool } from "./types";

export const categories: Category[] = [
  { name: 'Homepage', icon: Home },
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

export const tools: Tool[] = [
    {
        name: 'Warning Light Guide',
        slug: 'warning-light-guide',
        description: 'Understand what your dashboard warning lights mean and what to do about them.',
        icon: ShieldAlert,
    },
    {
        name: 'Smoke Color Diagnosis',
        slug: 'smoke-color-diagnosis',
        description: 'Diagnose potential engine issues based on the color of your exhaust smoke.',
        icon: Wind,
    },
    {
        name: 'Battery Health Checker',
        slug: 'battery-health-check',
        description: 'Check the health and charge level of your car battery based on its voltage.',
        icon: Battery,
    },
    {
        name: 'Tire Pressure Guide',
        slug: 'tire-pressure-guide',
        description: 'Determine if your tire pressure (PSI) is optimal, too low, or too high.',
        icon: GaugeCircle,
    },
    {
        name: 'Fuel Cost Calculator',
        slug: 'fuel-cost-calculator',
        description: 'Estimate the fuel cost for a trip based on distance, efficiency, and price.',
        icon: Gauge,
    },
    {
        name: 'Engine Temp Monitor',
        slug: 'engine-temp-monitor',
        description: 'Check if your engine temperature is within the normal operating range.',
        icon: Thermometer,
    },
    {
        name: 'Air Filter Checker',
        slug: 'air-filter-checker',
        description: 'Check if your air filter needs replacement based on kilometers driven.',
        icon: Filter,
    },
    {
        name: 'Engine Noise Analyzer',
        slug: 'engine-noise-analyzer',
        description: 'Simulate an engine noise analysis to detect potential issues.',
        icon: AudioWaveform,
    },
    {
        name: 'Belt Condition Estimator',
        slug: 'belt-condition-estimator',
        description: 'Estimate your car’s belt condition based on age.',
        icon: Replace,
    },
    {
        name: 'AC Performance Checker',
        slug: 'ac-performance-checker',
        description: 'Simulate a check of your air conditioner performance.',
        icon: AirVent,
    }
];
