import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const CARRERAS = [
    "Arquitectura",
    "Contador Público",
    "Ing. Automotriz",
    "Ing. Biomédica",
    "Ing. Bioquímica",
    "Ing. Civil",
    "Ing. Agronomía",
    "Ing. en Alimentos",
    "Ing. en Computación Inteligente",
    "Ing. en Diseño Mecánico",
    "Ing. en Electrónica",
    "Ing. en Energías Renovables",
    "Ing. en Manufactura y Automatización Industrial",
    "Ing. en Robótica",
    "Ing. en Sistemas Computacionales",
    "Ing. Industrial Estadístico",
    "Lic. en Actuación",
    "Lic. en Administración de Empresas",
    "Lic. en Administración de la Producción y Servicios",
    "Lic. en Administración Financiera",
    "Lic. en Administración y Gestión Fiscal de PYMES",
    "Lic. en Agronegocios",
    "Lic. en Artes Cinematográficas y Audiovisuales",
    "Lic. en Asesoría Psicopedagógica",
    "Lic. en Biología",
    "Lic. en Biotecnología",
    "Lic. en Ciencias Políticas y Administración Pública",
    "Lic. en Comercio Electrónico",
    "Lic. en Comercio Internacional",
    "Lic. en Comunicación e Información",
    "Lic. en Comunicación Corporativa Estratégica",
    "Lic. en Cultura Física y Deporte",
    "Lic. en Derecho",
    "Lic. en Desarrollo de Videojuegos y Entornos Virtuales (modalidad virtual)",
    "Lic. en Diseño de Interiores",
    "Lic. en Diseño de Modas en Indumentaria y Textiles",
    "Lic. en Diseño Gráfico",
    "Lic. en Diseño Industrial",
    "Lic. en Docencia de Francés y Español como Lenguas Extranjeras",
    "Lic. en Docencia del Idioma Inglés",
    "Lic. en Economía",
    "Lic. en Enfermería",
    "Lic. en Estudios del Arte y Gestión Cultural",
    "Lic. en Filosofía",
    "Lic. en Gestión Turística",
    "Lic. en Historia",
    "Lic. en Informática y Tecnologías Computacionales",
    "Lic. en Letras Hispánicas",
    "Lic. en Logística Empresarial",
    "Lic. en Matemáticas Aplicadas",
    "Lic. en Mercadotecnia",
    "Lic. en Música",
    "Lic. en Nutrición",
    "Lic. en Optometría",
    "Lic. en Psicología",
    "Lic. en Relaciones Industriales",
    "Lic. en Sociología",
    "Lic. en Terapia Física",
    "Lic. en Trabajo Social",
    "Lic. en Urbanismo",
    "Médico Cirujano",
    "Médico Estomatólogo",
    "Médico Veterinario Zootecnista",
    "Químico Farmacéutico Biólogo"
];

interface CarreraComboboxProps {
    value?: string;
    onValueChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export function CarreraCombobox({ value, onValueChange, error, disabled = false }: CarreraComboboxProps) {
    const [open, setOpen] = React.useState(false)

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
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar carrera..." />
                        <CommandList>
                            <CommandEmpty>No se encontró la carrera.</CommandEmpty>
                            <CommandGroup>
                                {CARRERAS.map((carrera) => (
                                    <CommandItem
                                        key={carrera}
                                        value={carrera}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue === value ? "" : currentValue)
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
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
