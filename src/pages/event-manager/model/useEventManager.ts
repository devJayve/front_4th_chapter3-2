import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useEventOperations } from '@/entities/event/model/useEventOperations.v2.ts';

export const useEventManager = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const { fetchEvents } = useEventOperations();

  useEffect(() => {
    async function _fetchEvents() {
      await fetchEvents();

      toast({
        title: '일정 로딩 완료!',
        status: 'info',
        duration: 1000,
      });
      setIsLoading(false);
    }
    _fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
  };
};
