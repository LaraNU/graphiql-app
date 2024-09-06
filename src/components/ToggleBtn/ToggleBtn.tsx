'use client';
import * as React from 'react';
import { ToggleButton } from '@mui/material';
import { ToggleButtonGroup } from '@mui/material';
import { enLanguage, ruLanguage } from '@/languages/languages';
import { changeLanguage } from '@/reducers/actions/actions';
import { AppDispatch } from '@/reducers/root/rootReduces';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

export default function ColorToggleButton() {
  const [alignment, setAlignment] = React.useState('en');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const language = localStorage.getItem('language_data');
    if (language === 'ru') {
      setAlignment('ru');
    }
  }, []);

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment !== null) {
      localStorage.setItem('language_data', newAlignment);
      if (newAlignment !== 'ru') {
        dispatch(changeLanguage(enLanguage));
      } else {
        dispatch(changeLanguage(ruLanguage));
      }
      setAlignment(newAlignment);
    }
  };

  return (
    <ToggleButtonGroup color="primary" value={alignment} exclusive onChange={handleChange} aria-label="Platform">
      <ToggleButton size="small" value="en">
        EN
      </ToggleButton>
      <ToggleButton size="small" value="ru">
        RU
      </ToggleButton>
    </ToggleButtonGroup>
  );
}