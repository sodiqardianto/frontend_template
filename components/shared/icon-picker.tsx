"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import * as LucideIcons from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Icon categories with common Lucide icons
const ICON_CATEGORIES = {
  navigation: [
    "Home", "Menu", "ChevronLeft", "ChevronRight", "ChevronUp", "ChevronDown",
    "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "CornerDownLeft",
    "ExternalLink", "Link", "Navigation", "Compass", "Map"
  ],
  actions: [
    "Plus", "Minus", "X", "Check", "Edit", "Pencil", "Trash", "Trash2",
    "Save", "Download", "Upload", "Copy", "Clipboard", "Share", "Send",
    "RotateCw", "RefreshCw", "Undo", "Redo"
  ],
  ui: [
    "Search", "Settings", "Sliders", "Filter", "SlidersHorizontal",
    "Bell", "BellRing", "Eye", "EyeOff", "Lock", "Unlock", "Key",
    "Shield", "ShieldCheck", "Info", "AlertCircle", "HelpCircle"
  ],
  users: [
    "User", "Users", "UserPlus", "UserMinus", "UserCheck", "UserX",
    "UserCog", "Contact", "CircleUser", "BadgeCheck"
  ],
  files: [
    "File", "FileText", "FileCode", "FilePlus", "Folder", "FolderOpen",
    "FolderPlus", "Image", "ImagePlus", "Video", "Music", "Archive"
  ],
  data: [
    "Database", "Server", "HardDrive", "Cloud", "CloudUpload", "CloudDownload",
    "Table", "TableProperties", "LayoutGrid", "LayoutList", "List", "ListOrdered"
  ],
  charts: [
    "BarChart", "BarChart2", "BarChart3", "LineChart", "PieChart",
    "TrendingUp", "TrendingDown", "Activity", "Gauge"
  ],
  communication: [
    "Mail", "MailOpen", "MessageSquare", "MessageCircle", "Phone",
    "PhoneCall", "Video", "Globe", "Wifi", "Rss"
  ],
  misc: [
    "Star", "Heart", "Bookmark", "Flag", "Tag", "Tags", "Calendar",
    "Clock", "Timer", "Zap", "Sparkles", "Gift", "Award", "Trophy"
  ],
} as const

// Flatten all icons for search
const ALL_ICONS = Object.entries(ICON_CATEGORIES).flatMap(([category, icons]) =>
  icons.map((icon) => ({ name: icon, category }))
)

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

// Dynamic icon component
function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]
  if (!IconComponent) return null
  return <IconComponent className={className} />
}

export function IconPicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select an icon",
  className,
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Filter icons based on search
  const filteredIcons = React.useMemo(() => {
    if (!search.trim()) return ALL_ICONS
    const query = search.toLowerCase()
    return ALL_ICONS.filter((icon) => icon.name.toLowerCase().includes(query))
  }, [search])

  // Group filtered icons by category
  const groupedIcons = React.useMemo(() => {
    const groups: Record<string, typeof ALL_ICONS> = {}
    for (const icon of filteredIcons) {
      if (!groups[icon.category]) {
        groups[icon.category] = []
      }
      groups[icon.category].push(icon)
    }
    return groups
  }, [filteredIcons])

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            {value ? (
              <>
                <DynamicIcon name={value} className="h-4 w-4" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-100 w-[350px] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center gap-2 border-b p-3">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          {/* Icons Grid - with visible scrollbar */}
          <div 
            className="h-[300px] overflow-y-scroll p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {filteredIcons.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No icons found.
              </p>
            ) : (
              Object.entries(groupedIcons).map(([category, icons]) => (
                <div key={category} className="mb-4">
                  <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <div className="grid grid-cols-6 gap-1">
                    {icons.map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => handleSelect(icon.name)}
                        className={cn(
                          "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-accent",
                          value === icon.name && "bg-accent ring-2 ring-primary"
                        )}
                        title={icon.name}
                      >
                        <DynamicIcon name={icon.name} className="h-5 w-5" />
                        {value === icon.name && (
                          <Check className="absolute -right-1 -top-1 h-3 w-3 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
