import { DialogProvider } from '@/app/provider/DialogProvider.tsx';
import EventManager from '@/pages/event-manager/ui/EventManager.tsx';

function App() {
  return (
    <>
      <EventManager />
      <DialogProvider />
    </>
  );
}

export default App;
