import React, { useState, useRef, useCallback } from 'react';

function FormWithFocusAndAlert() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const lastNameRef = useRef(null);

  const handleFocusLastName = () => {
    if (lastNameRef.current) {
      lastNameRef.current.focus();
    }
  };

  const handleShowData = useCallback(() => {
    alert(`First Name: ${firstName}, Last Name: ${lastName}`);
  }, [firstName, lastName]);

  return (
    <div style={{ maxWidth: 300, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={e => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        ref={lastNameRef}
        value={lastName}
        onChange={e => setLastName(e.target.value)}
      />
      <button type="button" onClick={handleFocusLastName}>
        Фокус на фамилию
      </button>
      <button type="button" onClick={handleShowData}>
        Показать данные
      </button>
    </div>
  );
}

export default FormWithFocusAndAlert;