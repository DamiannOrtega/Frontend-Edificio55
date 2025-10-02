import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Computer, User, Mail, Building, CodeSquare, LogIn, LogOut } from "lucide-react";

// Schema de validación para el formulario de registro
const registerSchema = z.object({
    id_estudiante: z.string().min(5, "El ID es requerido."),
    nombre_completo: z.string().min(3, "El nombre es requerido."),
    correo: z.string().email("El correo no es válido."),
    laboratorio: z.string().min(1, "Selecciona un laboratorio."),
    software: z.string().min(1, "Selecciona un software."),
    pc: z.string().min(1, "Selecciona una PC."),
});

// Schema de validación para el formulario de finalizar sesión
const finalizeSchema = z.object({
    id_estudiante_finalizar: z.string().min(5, "El ID es requerido."),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type FinalizeFormData = z.infer<typeof finalizeSchema>;

// Interfaces para los datos que vienen de la API de Django
interface Laboratorio { id: number; nombre: string; }
interface Software { id: number; nombre: string; }
interface PC { id: number; numero_pc: number; }

export default function LabVisitForm() {
    // Estado para controlar qué formulario se muestra: 'register' o 'finalize'
    const [mode, setMode] = useState<'register' | 'finalize'>('register');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
    const [softwareList, setSoftwareList] = useState<Software[]>([]);
    const [pcs, setPcs] = useState<PC[]>([]);

    // Instancia de useForm para el formulario de registro
    const { register, handleSubmit, formState: { errors }, setValue, reset: resetRegisterForm, watch } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    // Instancia de useForm para el formulario de finalizar
    const { register: registerFinalize, handleSubmit: handleFinalizeSubmit, formState: { errors: finalizeErrors }, reset: resetFinalizeForm } = useForm<FinalizeFormData>({
        resolver: zodResolver(finalizeSchema),
    });

    const selectedLab = watch("laboratorio");
    const selectedSoftware = watch("software");

    // Efecto para cargar los datos iniciales (todos los labs y software)
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/opciones-dinamicas/");
                if (!response.ok) throw new Error('No se pudo conectar con el servidor de Django.');
                const data = await response.json();
                setLaboratorios(data.laboratorios);
                setSoftwareList(data.software);
            } catch (error) {
                toast.error("Error al cargar datos iniciales", { description: (error as Error).message });
            }
        }
        fetchInitialData();
    }, []);

    // Efecto para filtrar cuando cambia el laboratorio
    useEffect(() => {
        if (selectedLab) {
            async function fetchLabOptions() {
                const response = await fetch(`http://127.0.0.1:8000/api/opciones-dinamicas/?laboratorio_id=${selectedLab}`);
                const data = await response.json();
                setSoftwareList(data.software);
                setPcs(data.pcs);
                setValue("pc", "");
            }
            fetchLabOptions();
        }
    }, [selectedLab, setValue]);

    // Efecto para filtrar cuando cambia el software
    useEffect(() => {
        if (selectedSoftware) {
            // Para evitar que se active cuando ya filtramos por laboratorio
            if (selectedLab) return;
            async function fetchSoftwareOptions() {
                const response = await fetch(`http://127.0.0.1:8000/api/opciones-dinamicas/?software_id=${selectedSoftware}`);
                const data = await response.json();
                setLaboratorios(data.laboratorios);
                setValue("laboratorio", "");
                setValue("pc", "");
                setPcs([]);
            }
            fetchSoftwareOptions();
        }
    }, [selectedSoftware, setValue]);

    // Función para autocompletar datos del estudiante
    const handleStudentIdBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
        const studentId = event.target.value;
        if (studentId) {
            const response = await fetch(`http://127.0.0.1:8000/api/buscar-estudiante/?id_estudiante=${studentId}`);
            const data = await response.json();
            if (data.encontrado) {
                setValue("nombre_completo", data.nombre);
                setValue("correo", data.correo);
            } else {
                setValue("nombre_completo", "");
                setValue("correo", "");
                toast.info("ID no encontrado. Por favor, completa tu registro.");
            }
        }
    };

    // Función para enviar el formulario de REGISTRO
    const onRegisterSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/registrar-visita/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Hubo un problema al registrar la visita.');
            }
            const result = await response.json();
            toast.success("Registro Exitoso", { description: result.message });
            resetRegisterForm();
        } catch (error) {
            toast.error("Error en el registro", { description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para enviar el formulario de FINALIZAR
    const onFinalizeSubmit = async (data: FinalizeFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/finalizar-visita/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_estudiante: data.id_estudiante_finalizar }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Hubo un problema al finalizar la sesión.');
            }
            toast.success("Sesión Finalizada", { description: result.message });
            resetFinalizeForm();
        } catch (error) {
            toast.error("Error al finalizar", { description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800">Laboratorio de Cómputo</h1>
                    <p className="text-lg text-gray-500">Registro de Visitas</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                    <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => setMode('register')}
                            className={`w-1/2 rounded-md py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${mode === 'register' ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <LogIn className="h-4 w-4" /> Registrar Visita
                        </button>
                        <button
                            onClick={() => setMode('finalize')}
                            className={`w-1/2 rounded-md py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${mode === 'finalize' ? 'bg-white shadow' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            <LogOut className="h-4 w-4" /> Finalizar Sesión
                        </button>
                    </div>

                    {mode === 'register' ? (
                        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="id_estudiante" className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> ID</Label>
                                <Input id="id_estudiante" {...register("id_estudiante")} onBlur={handleStudentIdBlur} placeholder="Tu ID" />
                                {errors.id_estudiante && <p className="text-sm text-red-500">{errors.id_estudiante.message}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_completo" className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Nombre Completo</Label>
                                    <Input id="nombre_completo" {...register("nombre_completo")} placeholder="Juan Pérez" />
                                    {errors.nombre_completo && <p className="text-sm text-red-500">{errors.nombre_completo.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="correo" className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" /> Correo Electrónico</Label>
                                    <Input id="correo" {...register("correo")} placeholder="juan.perez@universidad.com" />
                                    {errors.correo && <p className="text-sm text-red-500">{errors.correo.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="laboratorio" className="flex items-center gap-2 font-semibold"><Building className="h-4 w-4" /> Laboratorio</Label>
                                    <Select onValueChange={(value) => setValue("laboratorio", value)} value={selectedLab || ""}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona un lab" /></SelectTrigger>
                                        <SelectContent>
                                            {laboratorios.map((lab) => <SelectItem key={lab.id} value={String(lab.id)}>{lab.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.laboratorio && <p className="text-sm text-red-500">{errors.laboratorio.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="software" className="flex items-center gap-2 font-semibold"><CodeSquare className="h-4 w-4" /> Software</Label>
                                    <Select onValueChange={(value) => setValue("software", value)} value={selectedSoftware || ""}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona un software" /></SelectTrigger>
                                        <SelectContent>
                                            {softwareList.map((sw) => <SelectItem key={sw.id} value={String(sw.id)}>{sw.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.software && <p className="text-sm text-red-500">{errors.software.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pc" className="flex items-center gap-2 font-semibold"><Computer className="h-4 w-4" /> Computadora</Label>
                                <Select onValueChange={(value) => setValue("pc", value)}>
                                    <SelectTrigger disabled={!selectedLab}><SelectValue placeholder="Primero elige un lab" /></SelectTrigger>
                                    <SelectContent>
                                        {pcs.map((pc) => <SelectItem key={pc.id} value={String(pc.id)}>PC {pc.numero_pc}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.pc && <p className="text-sm text-red-500">{errors.pc.message}</p>}
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12">
                                {isSubmitting ? "Registrando..." : "Registrar Entrada"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleFinalizeSubmit(onFinalizeSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="id_estudiante_finalizar" className="flex items-center gap-2 font-semibold">
                                    <User className="h-4 w-4" /> ID para Finalizar Sesión
                                </Label>
                                <Input id="id_estudiante_finalizar" {...registerFinalize("id_estudiante_finalizar")} placeholder="Ingresa tu ID" />
                                {finalizeErrors.id_estudiante_finalizar && <p className="text-sm text-red-500">{finalizeErrors.id_estudiante_finalizar.message}</p>}
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-red-500 hover:bg-red-600">
                                {isSubmitting ? "Finalizando..." : "Finalizar Sesión"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}