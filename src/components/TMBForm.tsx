
import React, { useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import styles from './TMBForm.module.css';

interface FormValues {
  unitSystem: 'metric' | 'imperial';
  weight: number;
  heightCm?: number;
  heightFt?: number;
  heightIn?: number;
  age: number;
  gender: 'male' | 'female';
  bodyFat?: number | null;
  activityLevel: number;
}

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    unitSystem: yup
      .mixed<'metric' | 'imperial'>()
      .oneOf(['metric', 'imperial'])
      .required(),
    weight: yup
      .number()
      .typeError('Informe um número')
      .required('Peso obrigatório')
      .min(1, 'Peso inválido'),
    heightCm: yup
      .number()
      .typeError('Digite altura em cm')
      .when('unitSystem', (unitSystem: any, schema: any) =>
        unitSystem === 'metric'
          ? schema.required('Altura obrigatória').min(30, 'Altura mínima 30 cm')
          : schema.notRequired()
      ),
    heightFt: yup
      .number()
      .typeError('Digite altura em ft')
      .when('unitSystem', (unitSystem: any, schema: any) =>
        unitSystem === 'imperial'
          ? schema.required('Altura (ft) obrigatória').min(1, 'Mínimo 1 ft')
          : schema.notRequired()
      ),
    heightIn: yup
      .number()
      .typeError('Digite altura em in')
      .when('unitSystem', (unitSystem: any, schema: any) =>
        unitSystem === 'imperial'
          ? schema
              .required('Altura (in) obrigatória')
              .min(0, 'Mínimo 0 in')
              .max(11, 'Máximo 11 in')
          : schema.notRequired()
      ),
    age: yup
      .number()
      .typeError('Informe um número')
      .required('Idade obrigatória')
      .min(1, 'Idade inválida'),
    gender: yup
      .mixed<'male' | 'female'>()
      .oneOf(['male', 'female'])
      .required(),
    bodyFat: yup
      .number()
      .typeError('Informe um número')
      .nullable()
      .transform((value, original) => (original === '' ? null : value))
      .min(0, 'Não pode ser negativa')
      .max(100, 'Máx 100%'),
    activityLevel: yup
      .number()
      .typeError('Selecione um nível')
      .oneOf([1.2, 1.375, 1.55, 1.725, 1.9])
      .required('Selecione um nível'),
  })
  .required();

const TMBForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      unitSystem: 'metric',
      weight: 0,
      heightCm: 0,
      heightFt: 5,
      heightIn: 9,
      age: 0,
      gender: 'male',
      bodyFat: null,
      activityLevel: 1.2,
    },
  });

  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const levels = [
    { label: 'Sedentário (trabalho escritório)', value: 1.2 },
    { label: 'Exercício leve (1-2x/semana)', value: 1.375 },
    { label: 'Exercício moderado (3-5x/semana)', value: 1.55 },
    { label: 'Exercício intenso (6-7x/semana)', value: 1.725 },
    { label: 'Atleta (2x/dia)', value: 1.9 },
  ];

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    let weightKg: number;
    let heightCm: number;

    if (data.unitSystem === 'metric') {
      weightKg = data.weight;
      heightCm = data.heightCm!;
    } else {
      weightKg = data.weight * 0.45359237;
      const totalInches = data.heightFt! * 12 + data.heightIn!;
      heightCm = totalInches * 2.54;
    }

    
    let baseBmr: number;
    if (data.bodyFat != null) {
      const leanMass = weightKg * (1 - data.bodyFat / 100);
      baseBmr = 370 + 21.6 * leanMass;
    } else {
      
      if (data.gender === 'male') {
        baseBmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
      } else {
        baseBmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
      }
    }

    setBmr(baseBmr);
    setTdee(baseBmr * data.activityLevel);

    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const downloadPdf = () => {
    if (tdee == null || bmr == null) return;
    const doc = new jsPDF();
    doc.text('Resultado da TMB', 10, 10);
    doc.text(`BMR: ${bmr.toFixed(2)} kcal/dia`, 10, 20);
    doc.text(`TDEE: ${tdee.toFixed(2)} kcal/dia`, 10, 30);
    doc.save('tmb_detalhado.pdf');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Calculadora de Taxa Metabólica Basal</h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Unidades */}
        <div className={styles.inputGroup}>
          <label>Unidades:</label>
          <div className={styles.toggleGroup}>
            <label>
              <input type="radio" value="metric" {...register('unitSystem')} />
              Métrico
            </label>
            <label>
              <input type="radio" value="imperial" {...register('unitSystem')} />
              Imperial
            </label>
          </div>
        </div>

        {/* Peso & Altura */}
        {watch('unitSystem') === 'metric' ? (
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="weight">Peso (kg):</label>
              <input
                id="weight"
                type="number"
                step="0.1"
                {...register('weight')}
                onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
              />
              {errors.weight && <span className={styles.error}>{errors.weight.message}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="heightCm">Altura (cm):</label>
              <input
                id="heightCm"
                type="number"
                step="0.1"
                {...register('heightCm')}
                onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
              />
              {errors.heightCm && <span className={styles.error}>{errors.heightCm.message}</span>}
            </div>
          </div>
        ) : (
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="weight">Peso (lb):</label>
              <input
                id="weight"
                type="number"
                step="0.1"
                {...register('weight')}
                onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
              />
              {errors.weight && <span className={styles.error}>{errors.weight.message}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label>Altura:</label>
              <div className={styles.imperialHeight}>
                <input
                  id="heightFt"
                  type="number"
                  step="1"
                  placeholder="ft"
                  {...register('heightFt')}
                  onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
                />
                <span className={styles.imperialSep}>ft</span>
                <input
                  id="heightIn"
                  type="number"
                  step="1"
                  placeholder="in"
                  {...register('heightIn')}
                  onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
                />
                <span className={styles.imperialSep}>in</span>
              </div>
              {(errors.heightFt || errors.heightIn) && (
                <span className={styles.error}>
                  {errors.heightFt?.message || errors.heightIn?.message}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Idade & Gênero */}
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="age">Idade:</label>
            <input
              id="age"
              type="number"
              {...register('age')}
              onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
            />
            {errors.age && <span className={styles.error}>{errors.age.message}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="gender">Gênero:</label>
            <select id="gender" {...register('gender')}>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </div>
        </div>

        {/* % Gordura Corporal (opcional) */}
        <div className={styles.inputGroup}>
          <label htmlFor="bodyFat">Gordura Corporal (% – opcional):</label>
          <input
            id="bodyFat"
            type="number"
            step="0.1"
            {...register('bodyFat')}
            onFocus={(e) => e.currentTarget.value === '0' && (e.currentTarget.value = '')}
          />
          {errors.bodyFat && <span className={styles.error}>{errors.bodyFat.message}</span>}
        </div>

        {/* Nível de Atividade */}
        <fieldset className={styles.radioGroup}>
          <legend>Nível de Atividade</legend>
          {levels.map(({ label, value }) => (
            <label key={value}>
              <input
                type="radio"
                value={value}
                {...register('activityLevel', { valueAsNumber: true })}
              />
              {label}
            </label>
          ))}
          {errors.activityLevel && (
            <span className={styles.error}>{errors.activityLevel.message}</span>
          )}
        </fieldset>

        {/* Ações */}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button} disabled={!isValid}>
            Calcular
          </button>
          {tdee != null && (
            <button type="button" className={styles.button} onClick={downloadPdf}>
              Baixar PDF
            </button>
          )}
        </div>
      </form>

      {/* Resultado */}
      <AnimatePresence>
        {tdee != null && bmr != null && (
          <motion.div
            className={styles.result}
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3>TMB (puro): {bmr.toFixed(2)} kcal/dia</h3>
            <h3>Gasto Calórico Total: {tdee.toFixed(2)} kcal/dia</h3>
            <div className={styles.tdeeTable}>
              <h4>Calorias por Nível de Atividade:</h4>
              <ul>
                {levels.map(({ label, value }) => (
                  <li key={value}>
                    {label}: {(bmr * value).toFixed(2)} kcal/dia
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TMBForm;
