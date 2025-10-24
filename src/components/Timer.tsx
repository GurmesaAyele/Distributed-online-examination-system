import React, { useEffect, useState } from 'react';

export default function Timer({ endTime, onExpire } : { endTime: number | null, onExpire?: ()=>void }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(()=> setNow(Date.now()), 1000);
    return ()=> clearInterval(iv);
  }, []);

  if (!endTime) return <div>Timer: --:--</div>;
  const remainingMs = endTime - now;
  if (remainingMs <= 0) {
    if (onExpire) onExpire();
    return <div className="timer expired">00:00:00</div>;
  }
  const sec = Math.floor(remainingMs/1000) % 60;
  const min = Math.floor(remainingMs/60000) % 60;
  const hr = Math.floor(remainingMs/3600000);

  const pad = (n:number) => n.toString().padStart(2,'0');
  return <div className="timer">{pad(hr)}:{pad(min)}:{pad(sec)}</div>;
}
