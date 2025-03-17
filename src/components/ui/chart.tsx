"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"
import { ChartConfig } from "@/lib/types"

// Re-export recharts components
export {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    config: ChartConfig
}

export function ChartContainer({ config, children, className, ...props }: ChartContainerProps) {
    return (
        <div
            className={cn("h-80 w-full", className)}
            style={
                {
                    "--color-primary": "hsl(var(--primary))",
                    "--color-secondary": "hsl(var(--secondary))",
                    "--color-muted": "hsl(var(--muted))",
                    
                } as React.CSSProperties
            }
            {...props}
        >
            {children}
        </div>
    )
}

interface ChartTooltipProps extends React.ComponentPropsWithoutRef<"div"> {
    className?: string
    showArrow?: boolean
}

export function ChartTooltip({ className, children, showArrow = true, ...props }: ChartTooltipProps) {
    return (
        <div
            className={cn("rounded-lg border bg-background p-2 shadow-md", showArrow && "chart-tooltip-arrow", className)}
            {...props}
        >
            {children}
        </div>
    )
}

interface ChartTooltipContentProps {
    active?: boolean
    payload?: Array<{
        name: string
        value: string | number
        color: string
        dataKey: string
        payload: Record<string, any>
    }>
    label?: string
    formatter?: (value: number | string, name: string) => React.ReactNode
    labelFormatter?: (label: string) => React.ReactNode
}

export function ChartTooltipContent({ active, payload, label, formatter, labelFormatter }: ChartTooltipContentProps) {
    if (!active || !payload?.length) {
        return null
    }

    return (
        <ChartTooltip>
            <div className="grid gap-2">
                {label && <div className="text-xs text-muted-foreground">{labelFormatter ? labelFormatter(label) : label}</div>}
                <div className="grid gap-1">
                    {payload.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                            <span className="text-xs font-medium">
                                {item.name}:{" "}
                                {formatter
                                    ? formatter(item.value, item.name)
                                    : typeof item.value === "number"
                                        ? item.value.toLocaleString()
                                        : item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </ChartTooltip>
    )
}

