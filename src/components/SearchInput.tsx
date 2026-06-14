import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSearch } from '../redux/selectors/selectors';
import { useSearchProductsQuery } from '../api/storeApi';
import { clearSearchResults, setSearch, setSearchResults } from '../redux/features/searchSlice';
import { ClearInputIcon } from './icons/ClearInputIcon';

export const SearchInput = () => {
  const dispatch = useDispatch();
  const [skip, setSkip] = useState(true);
  const { searchQuery } = useSelector(selectSearch);

  useEffect(() => {
    if (searchQuery.length > 2) setSkip(false);
    else {
      setSkip(true);
      dispatch(clearSearchResults());
    }
  }, [searchQuery]);

  const searchData = useSearchProductsQuery({ searchQuery }, { skip });

  useEffect(() => {
    if (searchData.isSuccess) {
      dispatch(setSearchResults(searchData.data.searchResults));
    }
  }, [searchData]);

  const closeSearchResultsHandler = () => {
    dispatch(setSearch(''));
    dispatch(clearSearchResults());
  };

  return (
    <div className="input-wrapper">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        placeholder="Почніть вводити назву товару"
      />
      <div className="search-icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
          <g clipPath="url(#clip0_2_1806)">
            <path d="M3 10.5C3 11.4193 3.18106 12.3295 3.53284 13.1788C3.88463 14.0281 4.40024 14.7997 5.05025 15.4497C5.70026 16.0998 6.47194 16.6154 7.32122 16.9672C8.1705 17.3189 9.08075 17.5 10 17.5C10.9193 17.5 11.8295 17.3189 12.6788 16.9672C13.5281 16.6154 14.2997 16.0998 14.9497 15.4497C15.5998 14.7997 16.1154 14.0281 16.4672 13.1788C16.8189 12.3295 17 11.4193 17 10.5C17 9.58075 16.8189 8.6705 16.4672 7.82122C16.1154 6.97194 15.5998 6.20026 14.9497 5.55025C14.2997 4.90024 13.5281 4.38463 12.6788 4.03284C11.8295 3.68106 10.9193 3.5 10 3.5C9.08075 3.5 8.1705 3.68106 7.32122 4.03284C6.47194 4.38463 5.70026 4.90024 5.05025 5.55025C4.40024 6.20026 3.88463 6.97194 3.53284 7.82122C3.18106 8.6705 3 9.58075 3 10.5Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21.5L15 15.5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <defs>
            <clipPath id="clip0_2_1806">
              <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
            </clipPath>
          </defs>
        </svg>
      </div>
      {searchQuery.length > 0 && (
        <div className="clear-input-button-wrapper" onClick={closeSearchResultsHandler}>
          <ClearInputIcon />
        </div>
      )}
    </div>
  );
};
