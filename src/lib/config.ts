import { Cog, Signal, AlertTriangle, AppWindow, Wrench, Fuel, BatteryCharging, TrendingUp, ScanLine, Battery, Thermometer, GaugeCircle, Gauge, Filter, AudioWaveform, Replace, AirVent, Fingerprint } from "lucide-react";
import { Obd2Icon } from "@/components/icons/obd2-icon";
import type { Category, Tool } from "./types";

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

export const tools: Tool[] = [
    {
        name: 'VIN Decoder & Recall Check',
        slug: 'vin-decoder',
        description: 'Decode your VIN to get detailed vehicle specs and check for open safety recalls.',
        icon: Fingerprint,
    },
    {
        name: 'OBD Code Scanner',
        slug: 'obd-code-scanner',
        description: 'Lookup OBD2 trouble codes to understand what your check engine light means.',
        icon: ScanLine,
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
        name: 'Spark Plug Checker',
        slug: 'spark-plug-checker',
        description: 'Estimate if your spark plugs need replacement based on mileage.',
        icon: Wrench,
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
