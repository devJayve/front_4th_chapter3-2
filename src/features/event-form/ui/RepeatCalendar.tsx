import { ChevronLeftIcon, ChevronRightIcon, Spacer } from '@chakra-ui/icons';
import { Box, HStack, IconButton, Table, Tbody, Td, Text, Tr, VStack } from '@chakra-ui/react';

import { getWeeksAtMonth } from '@/utils/dateUtils.ts';

interface RepeatCalendarProps {
  currentDate: Date;
}

function RepeatCalendar({ currentDate }: RepeatCalendarProps) {
  const weeks = getWeeksAtMonth(currentDate);
  // const [selectedDate, setSelectedDate] = useState<number[]>([]);
  // const [weeks, setWeeks] = useState(getWeeksAtMonth(currentDate));

  // const handleMonthNavigation = (direction: 'prev' | 'next') => {
  //   if (direction === 'prev') {
  //     currentDate.setMonth(currentDate.getMonth() - 1);
  //   } else {
  //     currentDate.setMonth(currentDate.getMonth() + 1);
  //   }
  //   setWeeks(getFullWeeksAtMonth(currentDate.getMonth()));
  // };

  // const handleDateClick = (date: number) => {
  //   setSelectedDate((prev) => {
  //     return prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date];
  //   });
  // };

  return (
    <VStack width="100%">
      <HStack height="min-height" width="100%">
        <Text fontSize="sm">{currentDate.getMonth() + 1}월</Text>
        <Spacer />
        <HStack spacing={2}>
          <IconButton
            aria-label="Previous"
            icon={<ChevronLeftIcon />}
            size="sm"
            variant="ghost"
            // onClick={() => handleMonthNavigation('prev')}
          />
          <IconButton
            aria-label="Next"
            icon={<ChevronRightIcon />}
            size="sm"
            variant="ghost"
            // onClick={() => handleMonthNavigation('next')}
          />
        </HStack>
      </HStack>

      <Table variant="simple">
        <Tbody>
          {weeks.map((week, weekIndex) => (
            <Tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                // const isSelected = day && selectedDate.includes(day);
                const isSelected = false;
                return (
                  <Td
                    key={dayIndex}
                    verticalAlign="top"
                    position="relative"
                    padding="1"
                    borderBottom="none"
                    textAlign="center"
                  >
                    {day && (
                      <Box
                        as="button"
                        width="8"
                        height="8"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        borderRadius="full"
                        margin="auto"
                        cursor="pointer"
                        // onClick={() => handleDateClick(Number(day))}
                        bg={isSelected ? 'blue.500' : 'transparent'}
                        color={isSelected ? 'white' : 'inherit'}
                        _hover={{ bg: isSelected ? 'blue.600' : 'gray.100' }}
                      >
                        <Text fontSize="13" fontWeight={isSelected ? 'semibold' : 'normal'}>
                          {day}
                        </Text>
                      </Box>
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </VStack>
  );
}

export default RepeatCalendar;
