import LabVisitForm from './components/LabVisitForm';
import { Toaster } from "sonner";
// Importamos el componente para las notificaciones

function App() {
  return (
    <>
      <LabVisitForm />
      <Toaster richColors /> {/* Este componente muestra las notificaciones toast */}
    </>
  )
}

export default App;
