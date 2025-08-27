import { getPool } from '../common/db.js';
import sql from 'mssql';

export const getVitalsPayload = async (startDate, endDate) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('startDate', sql.Date, startDate)
    .input('endDate', sql.Date, endDate)
    .query(`
      SELECT TOP 50 saintmed.*,
        (
          SELECT TOP 1 VNMST_SUBQRY.hn
          FROM SSBDatabase.dbo.VNMST VNMST_SUBQRY
          WHERE VNMST_SUBQRY.vn = saintmed.vn
          ORDER BY VNMST_SUBQRY.VISITDATE DESC
        ) AS [hn]
      FROM SSBDatabase.dbo.saintmed
      WHERE CONVERT(DATE, LEFT(datetime, 8)) BETWEEN @startDate AND @endDate
      ORDER BY datetime DESC;
    `);

  return result.recordset.map(med => ({
    hn: med.hn,
    datetime: med.datetime,
    ip: med.ip,
    macAddress: med.macAddress ?? null,
    results: [
      { name: 'WEIGHT', value: med.weight, valueType: 'float', unit: 'kg' },
      { name: 'HEIGHT', value: med.height, valueType: 'float', unit: 'cm' },
      { name: 'BMI', value: med.bmi, valueType: 'float', unit: '' },
      { name: 'TEMPERATURE', value: med.temperature, valueType: 'float', unit: '°C' },
      { name: 'SYSTOLIC', value: med.systolic, valueType: 'integer', unit: 'mmHg' },
      { name: 'DIASTOLIC', value: med.diastolic, valueType: 'integer', unit: 'mmHg' },
      { name: 'PULSE', value: med.pulse, valueType: 'integer', unit: 'bpm' },
      { name: 'SPO2', value: med.spo2, valueType: 'integer', unit: '%' },
    ]
  }));
};

function calculateAgeTextThaiYMD(birthDate) {
  if (!(birthDate instanceof Date) || isNaN(birthDate)) {
    console.log('Raw birthDate:', birthDate)
    console.log('Type:', typeof birthDate)
    console.log('ToString:', birthDate.toString())
    console.log('ISO:', birthDate instanceof Date ? birthDate.toISOString() : 'ไม่ใช่ Date')
    return 'วันเกิดไม่ถูกต้อง';
  }

  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  return `${years} ปี ${months} เดือน ${days} วัน`;
};


