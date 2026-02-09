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
import { Computer, User, Mail, Building, CodeSquare, LogIn, LogOut, GraduationCap } from "lucide-react";
import { CarreraCombobox } from "@/components/ui/carrera-combobox";

// Schema de validación para el formulario de registro
const registerSchema = z.object({
  // 1. Validación para el ID de estudiante
  id_estudiante: z.string()
    .length(6, { message: "El ID debe tener exactamente 6 dígitos." })
    .regex(/^[0-9]+$/, { message: "El ID solo debe contener números." }),

  nombre_completo: z.string().min(3, "El nombre es requerido."),

  // 2. Validación para el correo (la que tenías es correcta)
  correo: z.string().email("El formato del correo no es válido."),

  // 3. Validación para el celular (opcional, pero si se llena debe ser válido)
  // IMPORTANTE: El orden de las validaciones importa - primero caracteres, luego longitud
  celular: z.string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || /^[0-9]*$/.test(val),
      { message: "El celular solo debe contener números." }
    )
    .refine(
      (val) => !val || val.length === 0 || val.length === 10,
      { message: "El celular debe tener exactamente 10 dígitos." }
    ),

  carrera: z.string().min(1, { message: "Por favor selecciona tu carrera." }),

  laboratorio: z.string().min(1, { message: "Por favor selecciona un laboratorio." }),
  software: z.string().min(1, { message: "Por favor selecciona un software." }),
  pc: z.string().min(1, { message: "Por favor selecciona una computadora." }),
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
  const [mode, setMode] = useState<'register' | 'finalize'>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [fieldsUnlocked, setFieldsUnlocked] = useState(false);
  const [lastSearchedId, setLastSearchedId] = useState<string>(""); // Para evitar búsquedas duplicadas
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [softwareList, setSoftwareList] = useState<Software[]>([]);
  const [pcs, setPcs] = useState<PC[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, reset: resetRegisterForm, watch, trigger } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange' // Cambiado a onChange para validación en tiempo real
  });

  const { register: registerFinalize, handleSubmit: handleFinalizeSubmit, formState: { errors: finalizeErrors }, reset: resetFinalizeForm } = useForm<FinalizeFormData>({
    resolver: zodResolver(finalizeSchema),
    mode: 'onBlur'
  });

  const selectedLab = watch("laboratorio");
  const selectedSoftware = watch("software");

  // Watch all required fields to enable/disable submit button
  const idEstudiante = watch("id_estudiante");
  const nombreCompleto = watch("nombre_completo");
  const correo = watch("correo");
  const carrera = watch("carrera");
  const pc = watch("pc");

  // Check if all required fields are filled
  const isFormValid = idEstudiante && nombreCompleto && correo && carrera && selectedLab && selectedSoftware && pc;

  const fetchInitialData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/opciones-dinamicas/");
      if (!response.ok) throw new Error('No se pudo conectar con el servidor de Django.');
      const data = await response.json();
      setLaboratorios(data.laboratorios);
      setSoftwareList(data.software);
    } catch (error) {
      toast.error("Error al cargar datos", { description: (error as Error).message });
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  useEffect(() => {
    if (selectedSoftware) {
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

  const searchStudent = async (studentId: string) => {
    if (!studentId) {
      setFieldsUnlocked(false);
      return;
    }

    // Evitar búsquedas duplicadas del mismo ID
    if (studentId === lastSearchedId) {
      return;
    }

    setIsSearchingStudent(true);
    setFieldsUnlocked(false);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/buscar-estudiante/?id_estudiante=${studentId}`);
      const data = await response.json();
      if (data.encontrado) {
        setValue("nombre_completo", data.nombre, { shouldValidate: true });
        setValue("correo", data.correo, { shouldValidate: true });
        setValue("celular", data.celular || "", { shouldValidate: true });
        setValue("carrera", data.carrera || "", { shouldValidate: true });
        toast.success("¡ID encontrado!", { description: `Bienvenido/a ${data.nombre}. Tus datos se han cargado automáticamente.` });
        setLastSearchedId(studentId); // Guardar el ID buscado
      } else {
        setValue("nombre_completo", "");
        setValue("correo", "");
        setValue("celular", "");
        setValue("carrera", "");
        toast.info("ID no encontrado. Por favor, completa tu registro.");
        setLastSearchedId(studentId); // Guardar el ID buscado
      }
    } finally {
      setIsSearchingStudent(false);
      setFieldsUnlocked(true);
    }
  };

  const handleStudentIdBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    trigger("id_estudiante");
    const studentId = event.target.value;
    await searchStudent(studentId);
  };

  const handleStudentIdKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevenir que el formulario se envíe
      trigger("id_estudiante");
      const studentId = event.currentTarget.value;
      await searchStudent(studentId);
    }
  };

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
      setLastSearchedId(""); // Resetear para permitir nueva búsqueda
      setFieldsUnlocked(false); // Bloquear campos hasta nuevo ID
    } catch (error) {
      toast.error("Error en el registro", { description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <img src="/logo.svg" alt="Logo UAA" className="mx-auto h-20 w-auto mb-4" />

          <h1 className="text-4xl font-bold text-gray-800">Edificio 55</h1>
          <p className="text-lg mt-2 text-gray-500">Departamento de Sistemas de Información</p>
          <p className="text-lg mt-2 text-gray-500">Registro de Uso de Laboratorios</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
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
                <Input
                  id="id_estudiante"
                  {...register("id_estudiante")}
                  onBlur={handleStudentIdBlur}
                  onKeyDown={handleStudentIdKeyDown}
                  placeholder="Tu ID"
                />
                {isSearchingStudent && <p className="text-sm text-blue-500">Buscando...</p>}
                {errors.id_estudiante && <p className="text-sm text-red-500">{errors.id_estudiante.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre_completo" className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Nombre Completo</Label>
                  <Input id="nombre_completo" {...register("nombre_completo")} placeholder="Ej. Juan Pérez García" disabled={!fieldsUnlocked} />
                  {errors.nombre_completo && <p className="text-sm text-red-500">{errors.nombre_completo.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo" className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" /> Correo Electrónico</Label>
                  <Input id="correo" {...register("correo")} placeholder="Ej. al218721@edu.uaa.mx" disabled={!fieldsUnlocked} />
                  {errors.correo && <p className="text-sm text-red-500">{errors.correo.message}</p>}
                </div>
                {/* Pega este bloque para el campo Celular */}
                <div className="space-y-2">
                  <Label htmlFor="celular" className="flex items-center gap-2 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Celular (Opcional)
                  </Label>
                  <Input
                    id="celular"
                    {...register("celular")}
                    placeholder="Ej. 4491234567"
                    disabled={!fieldsUnlocked}
                    maxLength={10}
                    type="tel"
                  />
                  {errors.celular && <p className="text-sm text-red-500">{errors.celular.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrera" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4" />
                    Carrera
                  </Label>
                  <CarreraCombobox
                    value={watch("carrera")}
                    onValueChange={(value) => setValue("carrera", value, { shouldValidate: true })}
                    error={errors.carrera?.message}
                    disabled={!fieldsUnlocked}
                  />
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
              <Button type="submit" disabled={isSubmitting || !isFormValid} className="w-full h-12">
                {isSubmitting ? "Registrando..." : "Registrar Entrada"}
              </Button>
              {!isFormValid && !isSubmitting && (
                <p className="text-sm text-center text-gray-500 mt-2">
                  Por favor completa todos los campos requeridos para continuar.
                </p>
              )}
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
    </div >
  );
}