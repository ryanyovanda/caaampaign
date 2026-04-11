'use client';

import { useState, useEffect } from 'react';

const WORDS = ['CAAAMPAIGN', 'Event', 'Launching Event', 'Festival', 'Concert', 'Seminar', 'Workshop', 'Exhibition', 'Conference', 'Gathering'];
const TYPE_SPEED = 40;
const DELETE_SPEED = 25;
const PAUSE_AFTER_TYPE = 1500;
const PAUSE_AFTER_DELETE = 500;

export function TypingText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('CAAAMPAIGN');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const current = WORDS[wordIndex];

    if (isPaused) {
      const isAboutToDelete = displayed === current;
      const pause = isAboutToDelete ? PAUSE_AFTER_TYPE : PAUSE_AFTER_DELETE;
      const t = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(isAboutToDelete);
      }, pause);
      return () => clearTimeout(t);
    }

    if (isDeleting) {
      if (displayed === '') {
        setIsPaused(true);
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % WORDS.length);
        return;
      }
      const t = setTimeout(() => {
        setDisplayed((prev) => prev.slice(0, -1));
      }, DELETE_SPEED);
      return () => clearTimeout(t);
    }

    if (displayed === current) {
      if (!isPaused) setIsPaused(true);
      return;
    }

    const t = setTimeout(() => {
      setDisplayed(current.slice(0, displayed.length + 1));
    }, TYPE_SPEED);
    return () => clearTimeout(t);
  }, [displayed, isDeleting, isPaused, wordIndex]);

  return (
    <span className="inline-block">
      {displayed}
      <span
        style={{ animation: 'blink 1s step-end infinite' }}
        className="ml-0.5 inline-block w-[3px] translate-y-[2px] rounded-sm bg-foreground align-middle"
      >
        &nbsp;
      </span>
    </span>
  );
}
