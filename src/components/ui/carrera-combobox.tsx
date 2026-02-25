import * as React from "react"
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface CarreraComboboxProps {
    value?: string;
    onValueChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export function CarreraCombobox({ value, onValueChange, error, disabled = false }: CarreraComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [carreras, setCarreras] = React.useState<string[]>([])
    const [loading, setLoading] = React.useState(false)
    const [addingNew, setAddingNew] = React.useState(false)
    const [nuevaCarrera, setNuevaCarrera] = React.useState("")
    const [savingNew, setSavingNew] = React.useState(false)

    // Load careers from API on mount
    React.useEffect(() => {
        async function fetchCarreras() {
            setLoading(true)
            try {
                const res = await fetch("http://127.0.0.1:8000/api/carreras/")
                if (!res.ok) throw new Error("Error al cargar carreras")
                const data = await res.json()
                setCarreras(data.carreras || [])
            } catch {
                toast.error("No se pudieron cargar las carreras.")
            } finally {
                setLoading(false)
            }
        }
        fetchCarreras()
    }, [])

    const handleAddCarrera = async () => {
        const nombre = nuevaCarrera.trim()
        if (!nombre) return
        setSavingNew(true)
        try {
            const res = await fetch("http://127.0.0.1:8000/api/carreras/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre }),
            })
            const data = await res.json()
            if (res.ok || res.status === 200) {
                if (data.creada) {
                    setCarreras(prev => [...prev, data.nombre].sort())
                    toast.success(`Carrera "${data.nombre}" agregada.`)
                } else {
                    toast.info(`La carrera "${data.nombre}" ya existe.`)
                }
                onValueChange(data.nombre)
                setNuevaCarrera("")
                setAddingNew(false)
                setOpen(false)
            } else {
                toast.error(data.error || "Error al guardar la carrera.")
            }
        } catch {
            toast.error("Error de conexión al guardar la carrera.")
        } finally {
            setSavingNew(false)
        }
    }

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-between",
                            !value && "text-muted-foreground",
                            error && "border-red-500"
                        )}
                    >
                        <span className="truncate">{value || "Selecciona tu carrera..."}</span>
                        {loading
                            ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                            : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        }
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar carrera..." />
                        <CommandList>
                            {loading && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Cargando carreras...
                                </div>
                            )}
                            {!loading && (
                                <CommandEmpty>No se encontró la carrera.</CommandEmpty>
                            )}
                            <CommandGroup>
                                {carreras.map((carrera) => (
                                    <CommandItem
                                        key={carrera}
                                        value={carrera}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue === value ? "" : currentValue)
                                            setAddingNew(false)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === carrera ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {carrera}
                                    </CommandItem>
                                ))}
                            </CommandGroup>

                            {/* Sección para agregar nueva carrera */}
                            <CommandSeparator />
                            <CommandGroup>
                                {!addingNew ? (
                                    <CommandItem
                                        onSelect={() => setAddingNew(true)}
                                        className="text-blue-600 font-medium cursor-pointer"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agregar nueva carrera...
                                    </CommandItem>
                                ) : (
                                    <div className="p-2 flex gap-2 items-center">
                                        <Input
                                            autoFocus
                                            placeholder="Nombre de la nueva carrera"
                                            value={nuevaCarrera}
                                            onChange={e => setNuevaCarrera(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") { e.preventDefault(); handleAddCarrera() }
                                                if (e.key === "Escape") { setAddingNew(false); setNuevaCarrera("") }
                                            }}
                                            className="h-8 text-sm"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleAddCarrera}
                                            disabled={savingNew || !nuevaCarrera.trim()}
                                            className="h-8 px-3 shrink-0"
                                        >
                                            {savingNew ? <Loader2 className="h-3 w-3 animate-spin" /> : "Agregar"}
                                        </Button>
                                    </div>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
