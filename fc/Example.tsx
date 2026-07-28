import React, { useState } from 'react';
import Modal from "./Modal";

export default function Example() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  const handleAgeChange = () => {
    setAge(a => a + 1);
  };

  return (
    <>
      <input
        value={name}
        onChange={handleNameChange}
      />
      <button onClick={handleAgeChange}>
        Increment age
      </button>

      <p>Hello, {name}. You are {age}.</p>

      <Modal>
        <h1>{age}</h1>
      </Modal>
    </>
  );
}
