import LabVisitForm from './components/LabVisitForm';
import { Toaster } from "sonner";
// Importamos el componente para las notificaciones

function App() {
  return (
    <>
      <LabVisitForm />
      <Toaster
        richColors
        position="top-center"
        expand={true}
        duration={5000}
        toastOptions={{
          style: {
            fontSize: '16px',
            padding: '16px 24px',
            minWidth: '400px',
            maxWidth: '600px',
          },
          className: 'toast-custom',
        }}
      /> {/* Este componente muestra las notificaciones toast */}
    </>
  )
}

export default App;
