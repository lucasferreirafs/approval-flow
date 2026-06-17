"use client"

import { cn } from "@/lib/utils"
import { useState, useRef, useEffect, KeyboardEvent } from "react"

export type SelectOption = {
    value: string
    label: string
    color?: string
}

type CustomSelectProps = {
    options: SelectOption[]
    placeholder?: string
    searchable?: boolean
    multiple?: boolean
    showDot?: boolean
    className?: string
    value?: string | string[]
    onChange?: (value: string | string[]) => void
}

export function CustomSelect({
    options,
    placeholder = "Selecione...",
    searchable = false,
    multiple = false,
    showDot = false,
    className = "",
    value,
    onChange,
}: CustomSelectProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const wrapRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const selected: string[] = multiple
        ? Array.isArray(value) ? value : []
        : value ? [value as string] : []

    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
    )

    function toggle() {
        setOpen((v) => !v)
        if (!open) {
            setQuery("")
            setTimeout(() => searchRef.current?.focus(), 50)
        }
    }

    function pick(val: string) {
        if (multiple) {
            const next = selected.includes(val)
                ? selected.filter((v) => v !== val)
                : [...selected, val]
            onChange?.(next)
        } else {
            onChange?.(val)
            setOpen(false)
        }
    }

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", onClickOutside)
        return () => document.removeEventListener("mousedown", onClickOutside)
    }, [])

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false)
        if (e.key === "Enter" || e.key === " ") toggle()
    }

    const selectedOptions = options.filter((o) => selected.includes(o.value))

    return (
        <div ref={wrapRef} className="relative select-none font-sans">
            {/* Trigger */}
            <div
                role="combobox"
                aria-expanded={open}
                aria-controls="dropdown-options"
                tabIndex={0}
                onKeyDown={onKeyDown}
                onClick={toggle}
                className={cn(
                    "flex items-center justify-between gap-2 px-3.5 h-11 cursor-pointer",
                    "bg-background rounded-[10px] text-sm transition-all border border-input",
                    "hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                    `${className}`,
                    `${open ? "border-violet-400 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]" : ""}`
                )}
            >
            {/* Value display */}
            <span className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                {selectedOptions.length === 0 ? (
                    <span className="text-neutral-400">{placeholder}</span>
                ) : multiple ? (
                    <span className="flex flex-wrap gap-1 items-center">
                        {selectedOptions.map((o) => (
                            <span
                                key={o.value}
                                className="flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-md max-w-30"
                            >
                                <span className="truncate">{o.label}</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); pick(o.value) }}
                                    className="opacity-60 hover:opacity-100 leading-none"
                                    aria-label={`Remover ${o.label}`}
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </span>
                ) : (
                    <>
                        {showDot && selectedOptions[0]?.color && (
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: selectedOptions[0].color }}
                            />
                        )}
                        <span className="truncate text-neutral-900 dark:text-neutral-100">
                            {selectedOptions[0]?.label}
                        </span>
                    </>
                )}
            </span>

            {/* Chevron */}
            <svg
                className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

            {/* Dropdown */ }
    <div
        className={`
          absolute top-[calc(100%+6px)] left-0 right-0 z-50
          bg-white dark:bg-neutral-900
          border-[1.5px] border-neutral-200 dark:border-neutral-700
          rounded-[10px] overflow-hidden transition-all
          ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1.5 pointer-events-none"}
        `}
    >
        {/* Search */}
        {searchable && (
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full h-8 pl-7 pr-3 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-violet-400"
                    />
                </div>
            </div>
        )}

        {/* Options */}
        <div className="max-h-55 overflow-y-auto p-1">
            {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-neutral-400 text-center">
                    Nenhum resultado
                </div>
            ) : (
                filtered.map((opt) => {
                    const isSel = selected.includes(opt.value)
                    return (
                        <div
                            key={opt.value}
                            onClick={() => pick(opt.value)}
                            className={`
                    flex items-center justify-between px-2.5 py-2 rounded-[7px]
                    cursor-pointer text-sm transition-colors
                    ${isSel
                                    ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                                    : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                }
                  `}
                        >
                            <span className="flex items-center gap-2.5">
                                {showDot && opt.color && (
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                                )}
                                {opt.label}
                            </span>
                            {isSel && (
                                <svg className="w-3.5 h-3.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    )
                })
            )}
        </div>
    </div>
        </div >
    )
}