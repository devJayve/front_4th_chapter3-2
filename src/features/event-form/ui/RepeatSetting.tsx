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
import { ChangeEvent } from 'react';

import { DayOfWeek, RepeatEndType, RepeatInfo, RepeatType } from '@/app/types/RepeatInfo.ts';

interface RepeatSettingProps {
  repeatInfo: RepeatInfo;
  updateRepeatInfo: (info: Partial<RepeatInfo>) => void;
}

function RepeatSetting({ repeatInfo, updateRepeatInfo }: RepeatSettingProps) {
  // 반복 종료 설정 변경 (종료 없음, 날짜, 횟수)
  const handleRepeatEndTypeChange = (endType: RepeatEndType) => {
    console.log('endtype 변경:', endType);
    updateRepeatInfo({ endType: endType });

    if (endType === RepeatEndType.BY_COUNT) {
      updateRepeatInfo({ endCount: 1 });
    }
    if (endType === RepeatEndType.BY_DATE) {
      updateRepeatInfo({ endDate: '2025-06-30' });
    }
  };

  const handleShowRepeatInfo = (e: ChangeEvent<HTMLInputElement>) => {
    updateRepeatInfo({ type: e.target.checked ? 'daily' : 'none' });
  };

  return (
    <>
      <FormControl>
        <FormLabel>반복 설정</FormLabel>
        <Checkbox isChecked={repeatInfo.type !== 'none'} onChange={handleShowRepeatInfo}>
          반복 일정
        </Checkbox>
      </FormControl>
      {repeatInfo.type !== 'none' && (
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
            <FormControl>
              <FormLabel>반복 요일</FormLabel>
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
            </FormControl>
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
            <FormControl>
              <FormLabel>반복 종료 날짜</FormLabel>
              <Input
                type="date"
                value={repeatInfo.endDate}
                onChange={(e) => updateRepeatInfo({ endDate: e.target.value })}
              />
            </FormControl>
          )}
          {repeatInfo.endType === RepeatEndType.BY_COUNT && (
            <FormControl>
              <FormLabel>반복 종료 횟수</FormLabel>
              <Input
                type="number"
                value={repeatInfo.endCount}
                onChange={(e) => updateRepeatInfo({ endCount: Number(e.target.value) })}
              />
            </FormControl>
          )}
        </VStack>
      )}
    </>
  );
}

export default RepeatSetting;
