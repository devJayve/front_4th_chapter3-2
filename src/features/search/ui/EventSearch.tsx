import { FormControl, FormLabel, Input } from '@chakra-ui/react';

import { useSearch } from '@/features/search/model/useSearch.v2.ts';

function EventSearch() {
  const { searchTerm, setSearchTerm } = useSearch();
  return (
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </FormControl>
  );
}

export default EventSearch;
