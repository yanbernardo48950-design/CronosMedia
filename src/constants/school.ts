import { AppointmentCategory, LessonCategory, SchoolShift } from '../types';

export const LESSON_CATEGORIES: { value: LessonCategory; label: string; shortLabel: string; defaultTime: string }[] = [
  { value: '1_aula', label: '1ª Aula', shortLabel: '1ª Aula', defaultTime: '07:30' },
  { value: '2_aula', label: '2ª Aula', shortLabel: '2ª Aula', defaultTime: '08:20' },
  { value: '3_aula', label: '3ª Aula', shortLabel: '3ª Aula', defaultTime: '09:10' },
  { value: '4_aula', label: '4ª Aula', shortLabel: '4ª Aula', defaultTime: '10:20' },
  { value: '5_aula', label: '5ª Aula', shortLabel: '5ª Aula', defaultTime: '11:10' },
];

export const VESPERTINO_CLASSES: string[] = ['62.01', '62.02', '72.01', '82.01', '92.01'];

export const MATUTINO_CLASSES: string[] = ['13.01', '14.01', '23.01', '24.01', '33.01', '34.01'];

export const ALL_SCHOOL_CLASSES: { code: string; shift: SchoolShift; shiftLabel: string }[] = [
  ...VESPERTINO_CLASSES.map((code) => ({
    code,
    shift: 'vespertino' as SchoolShift,
    shiftLabel: 'Vespertino',
  })),
  ...MATUTINO_CLASSES.map((code) => ({
    code,
    shift: 'matutino' as SchoolShift,
    shiftLabel: 'Matutino',
  })),
];

export function getShiftForClass(classCode?: string): SchoolShift | undefined {
  if (!classCode) return undefined;
  if (VESPERTINO_CLASSES.includes(classCode)) return 'vespertino';
  if (MATUTINO_CLASSES.includes(classCode)) return 'matutino';
  return undefined;
}

export function getShiftLabel(shift?: SchoolShift): string {
  if (shift === 'vespertino') return 'Vespertino';
  if (shift === 'matutino') return 'Matutino';
  return '';
}

export function getCategoryLabel(category: AppointmentCategory): string {
  const lesson = LESSON_CATEGORIES.find((l) => l.value === category);
  if (lesson) return lesson.label;

  switch (category) {
    case 'reuniao':
      return 'Reunião';
    case 'producao':
      return 'Produção';
    case 'vistoria':
      return 'Vistoria';
    case 'gravacao':
      return 'Gravação';
    case 'ensaio':
      return 'Ensaio';
    case 'cliente':
      return 'Cliente';
    default:
      return 'Outro';
  }
}

export function isLessonCategory(category: AppointmentCategory): category is LessonCategory {
  return ['1_aula', '2_aula', '3_aula', '4_aula', '5_aula'].includes(category);
}
