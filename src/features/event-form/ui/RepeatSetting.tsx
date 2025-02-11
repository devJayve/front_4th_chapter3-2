import {
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import { DayOfWeek, RepeatEndType, RepeatInfo, RepeatType } from '@/app/types/RepeatInfo.ts';

interface RepeatSettingProps {
  repeatInfo: RepeatInfo;
  updateRepeatInfo: (info: Partial<RepeatInfo>) => void;
}

function RepeatSetting({ repeatInfo, updateRepeatInfo }: RepeatSettingProps) {
  const [showRepeatInfo, setShowRepeatInfo] = useState(false);

  // 반복 종료 설정 변경 (종료 없음, 날짜, 횟수)
  const handleRepeatEndTypeChange = (endType: RepeatEndType) => {
    updateRepeatInfo({ endType: endType });

    if (endType === RepeatEndType.BY_COUNT) {
      updateRepeatInfo({ endCount: 1 });
    }
    if (endType === RepeatEndType.BY_DATE) {
      updateRepeatInfo({ endDate: '2025-06-30' });
    }
  };

  return (
    <>
      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={showRepeatInfo} onChange={(e) => setShowRepeatInfo(e.target.checked)}>
          반복 일정
        </Checkbox>
      </FormControl>
      {showRepeatInfo && (
        <VStack width="100%">
          <HStack width="100%">
            <FormControl>
              <FormLabel>반복 유형</FormLabel>
              <Select
                value={repeatInfo.type}
                onChange={(e) => updateRepeatInfo({ type: e.target.value as RepeatType })}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>반복 간격</FormLabel>
              <Input
                type="number"
                value={repeatInfo.interval}
                onChange={(e) => updateRepeatInfo({ interval: Number(e.target.value) })}
                min={1}
              />
            </FormControl>
          </HStack>
          {repeatInfo.type === 'weekly' && (
            <RadioGroup
              defaultValue="M"
              onChange={(value) => updateRepeatInfo({ dayOfWeek: value as DayOfWeek })}
            >
              <HStack gap="4">
                <Radio value="sunday">S</Radio>
                <Radio value="monday">M</Radio>
                <Radio value="tuesday">T</Radio>
                <Radio value="wedsday">W</Radio>
                <Radio value="thursday">T</Radio>
                <Radio value="friday">F</Radio>
                <Radio value="saturday">S</Radio>
              </HStack>
            </RadioGroup>
          )}
          <FormControl>
            <FormLabel>반복 종료일</FormLabel>
            <Select
              value={repeatInfo.endType}
              onChange={(e) => handleRepeatEndTypeChange(e.target.value as RepeatEndType)}
            >
              <option value={RepeatEndType.ENDLESS}>종료 없음</option>
              <option value={RepeatEndType.BY_DATE}>날짜</option>
              <option value={RepeatEndType.BY_COUNT}>횟수</option>
            </Select>
          </FormControl>
          {repeatInfo.endType === RepeatEndType.BY_DATE && (
            <Input
              type="date"
              value={repeatInfo.endDate}
              onChange={(e) => updateRepeatInfo({ endDate: e.target.value })}
            />
          )}
          {repeatInfo.endType === RepeatEndType.BY_COUNT && (
            <Input
              type="number"
              value={repeatInfo.endCount}
              onChange={(e) => updateRepeatInfo({ endCount: Number(e.target.value) })}
            />
          )}
        </VStack>
      )}
    </>
  );
}

export default RepeatSetting;
