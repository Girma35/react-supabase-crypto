import React, { useState, FormEvent ,useEffect} from 'react';
import supabase from './supabaseClient';


interface Coin {
  coin_name: string;
  volume_24h: number;
}

interface FormProps {
  metrics: Coin[];
}

const MyForm: React.FC<FormProps> = ({ metrics }) => {

    
const [submitted,setSubmited] = useState(false);

  const [newCoin, setNewCoin] = useState<Coin>({
    coin_name: '',
    volume_24h: 0,
  });

  // Handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmited(true)
  };

  // Handle input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setNewCoin((prevState) => ({
      ...prevState,
      [name]: name === 'value' ? parseFloat(value) : value, // Parse value as a number for volume_24h
    }));
  };


useEffect(() =>{

    const addCryptoData = async () => {

        try {

          const {error } = await supabase

            .from('crypto__ranking')
            .insert([newCoin])
            console.log('add data:', newCoin);
          if (error) throw error;
          }catch (error){
            console.log("error",error);
          }
        };
        if (submitted){
            addCryptoData();
        }
       
},[submitted])

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="coin_name"
          placeholder="Enter coin name"
          value={newCoin.coin_name}
          onChange={handleChange}
        />
        <input
          type="number"
          name="volume_24h"
          placeholder="Enter volume 24h"
          value={newCoin.volume_24h}
          onChange={handleChange}
        />
        <button type="submit">Add Coin</button>
      </form>
    </div>
  );
};

export default MyForm;
