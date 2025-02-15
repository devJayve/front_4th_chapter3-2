import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';
import React from 'react';

import { useDialogStore } from '@/entities/dialog/store/useDialogStore.ts';
import { Event } from '@/types';

interface OverlapDialogProps {
  overlappingEvents: Event[];
  onConfirm: () => void;
}

function OverlapDialog({ overlappingEvents, onConfirm }: OverlapDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const close = useDialogStore((state) => state.close);

  return (
    <AlertDialog
      data-testid="overlap-dialog"
      isOpen
      onClose={close}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            일정 겹침 경고
          </AlertDialogHeader>

          <AlertDialogBody>
            다음 일정과 겹칩니다:
            {overlappingEvents.map((event) => (
              <Text key={event.id}>
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Text>
            ))}
            계속 진행하시겠습니까?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={close}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onConfirm();
                close();
              }}
              ml={3}
            >
              계속 진행
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default OverlapDialog;
