import React, { useState, useRef } from 'react';
import styles from './TMBForm.module.css';

const TMBForm: React.FC = () => {
    const [weight, setWeight] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [age, setAge] = useState<number | string>('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [bodyFat, setBodyFat] = useState<number | string>('');
    const [activityLevel, setActivityLevel] = useState<number>(1.2);
    const [result, setResult] = useState<number | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const calculateTMB = () => {
        if (weight && height && age) {
            let tmb: number;
            const weightNum = Number(weight);
            const heightNum = Number(height);
            const ageNum = Number(age);
            const bodyFatNum = bodyFat ? Number(bodyFat) : null;

            if (bodyFatNum) {
                
                tmb = 370 + (21.6 * (1 - (bodyFatNum / 100)) * weightNum);
            } else {
                
                if (gender === 'male') {
                    tmb = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
                } else {
                    tmb = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
                }
            }

            tmb *= activityLevel;
            setResult(tmb);

            // Scroll to result
            setTimeout(() => {
                if (resultRef.current) {
                    resultRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Calculadora de Taxa de Metabolismo Basal</h1>
            </header>
            <div className={styles.inputGroup}>
                <label>
                    Peso (kg):
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </label>
            </div>
            <div className={styles.inputGroup}>
                <label>
                    Altura (cm):
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                    />
                </label>
            </div>
            <div className={styles.inputGroup}>
                <label>
                    Idade:
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                </label>
            </div>
            <div className={styles.inputGroup}>
                <label>
                    Gênero:
                    <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')}>
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </label>
            </div>
            <div className={styles.inputGroup}>
                <label>
                    Percentual de Gordura Corporal (%):
                    <input
                        type="number"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(e.target.value)}
                    />
                </label>
            </div>
            <div className={styles.inputGroup}>
                <label>Nível de Atividade Física:</label>
                <div className={styles.radioGroup}>
                    <label>
                        <input
                            type="radio"
                            value={1.2}
                            checked={activityLevel === 1.2}
                            onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        />
                        Sedentário (trabalho de escritório)
                    </label>
                    <label>
                        <input
                            type="radio"
                            value={1.375}
                            checked={activityLevel === 1.375}
                            onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        />
                        Exercício leve (1-2 dias/semana)
                    </label>
                    <label>
                        <input
                            type="radio"
                            value={1.55}
                            checked={activityLevel === 1.55}
                            onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        />
                        Exercício moderado (3-5 dias/semana)
                    </label>
                    <label>
                        <input
                            type="radio"
                            value={1.725}
                            checked={activityLevel === 1.725}
                            onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        />
                        Exercício intenso (6-7 dias/semana)
                    </label>
                    <label>
                        <input
                            type="radio"
                            value={1.9}
                            checked={activityLevel === 1.9}
                            onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        />
                        Atleta (2 vezes por dia)
                    </label>
                </div>
            </div>
            <button className={styles.button} onClick={calculateTMB}>Calcular TMB</button>
            {result !== null && (
                <div className={styles.result} ref={resultRef}>
                    <h3>Taxa Metabólica Basal: {result.toFixed(2)} calorias/dia</h3>
                </div>
            )}
        </div>
    );
};

export default TMBForm;
