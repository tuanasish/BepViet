import React from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const getDifficultyLabel = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'Dễ';
    case 'medium':
      return 'Trung bình';
    case 'hard':
      return 'Khó';
    default:
      return difficulty;
  }
};

export const getDifficultyColorClasses = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
  }
};

export const getDifficultyBadge = (difficulty: Difficulty): React.ReactElement => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getDifficultyColorClasses(difficulty)}`}>
      {getDifficultyLabel(difficulty)}
    </span>
  );
};

export const getDifficultyDotColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'hard':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};









